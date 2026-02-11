<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Section;
use App\Models\EmploymentStatus;
use App\Models\Contract;
use App\Models\Assignment;
use App\Models\Resignation;
use App\Models\ActivityLog;
use App\Models\EmployeeTimeline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $showArchived = $request->get('archived', false);
        $search = $request->get('search', '');
        $section = $request->get('section', '');
        $status = $request->get('status', '');
        $position = $request->get('position', '');
        
        $employees = Employee::with(['officeAssigned', 'employmentStatus', 'currentAssignment'])
            ->when($showArchived, function ($query) {
                return $query->where('is_archive', true);
            }, function ($query) {
                return $query->where('is_archive', false);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhereRaw("first_name || ' ' || last_name LIKE ?", ['%' . $search . '%'])
                      ->orWhereHas('currentAssignment', function ($assignmentQuery) use ($search) {
                          $assignmentQuery->where('position', 'like', '%' . $search . '%');
                      });
                });
            })
            ->when($section, function ($query, $section) {
                return $query->where('office_assigned_id', $section);
            })
            ->when($status, function ($query, $status) {
                return $query->where('employment_status_id', $status);
            })
            ->when($position, function ($query, $position) {
                return $query->where(function ($q) use ($position) {
                    $q->where('position', 'like', '%' . $position . '%')
                      ->orWhereHas('currentAssignment', function ($assignmentQuery) use ($position) {
                          $assignmentQuery->where('position', 'like', '%' . $position . '%');
                      });
                });
            })
            ->orderBy('last_name')
            ->paginate(10);

        // Get all employment statuses for lookup
        $employmentStatuses = EmploymentStatus::all();
        $statusMap = $employmentStatuses->pluck('name', 'id')->toArray();

        // Manually attach status names, positions, and archivability to employees (handle pagination properly)
        $employees->getCollection()->each(function ($employee) use ($statusMap) {
            $employee->status_name = $statusMap[$employee->employment_status_id] ?? 'No Status';
            
            // Get current position from assignment if not set on employee
            if (!$employee->position && $employee->currentAssignment) {
                $employee->position = $employee->currentAssignment->position;
            }
            
            // Add archivability status
            $employee->archivability_status = $employee->archivability_status;
            
            // Calculate length of service using the model method
            $employee->length_of_service = $employee->getLengthOfServiceAttribute();
        });

        // Get unique positions for filter dropdown from both employees and assignments
        $employeePositions = Employee::whereNotNull('position')
            ->where('position', '!=', '')
            ->pluck('position');
            
        $assignmentPositions = Assignment::whereNotNull('position')
            ->where('position', '!=', '')
            ->pluck('position');
            
        $positions = $employeePositions->merge($assignmentPositions)
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Admin/ManageEmployee', [
            'employees' => $employees,
            'showArchived' => $showArchived,
            'sections' => Section::all(),
            'employmentStatuses' => $employmentStatuses,
            'positions' => $positions,
        ]);
    }

    public function import(Request $request)
    {
        try {
            \Log::info('Import method called with data: ' . json_encode($request->all()));
            
            $request->validate([
                'employees' => 'required|array',
                'employees.*.first_name' => 'required|string|max:255',
                'employees.*.middle_name' => 'nullable|string|max:255',
                'employees.*.last_name' => 'required|string|max:255',
                'employees.*.OFFICE' => 'nullable|string|max:255',
                'employees.*.position' => 'required|string|max:255',
                'employees.*.suffix' => 'nullable|string|max:50',
                'employees.*.sex' => 'nullable|string|max:10',
                'employees.*.employment_status' => 'nullable|string|max:255',
                'employees.*.contract_type' => 'nullable|string|max:255',
                'employees.*.date_started' => 'required|date',
                'employees.*.date_resigned' => 'nullable|date|after_or_equal:date_started',
                'reset' => 'nullable|boolean',
            ]);

            \Log::info('Starting bulk import processing');

        // Temporarily disable foreign key checks for SQLite
        \DB::statement('PRAGMA foreign_keys = OFF');

        // Reset/Replace option - Delete all existing records
        if ($request->boolean('reset')) {
            try {
                // Delete all related records first
                \DB::table('assignments')->delete();
                \DB::table('contracts')->delete();
                \DB::table('employee_timeline')->delete();
                
                // Delete all employees (including soft deleted)
                \DB::table('employees')->delete();
                
            } catch (\Exception $e) {
                return back()->with('error', 'Failed to reset database: ' . $e->getMessage());
            }
        }

        $importedCount = 0;
        $updatedCount = 0;
        $errors = [];

        // Prepare bulk data arrays
        $employeesToInsert = [];
        $employeesToUpdate = [];
        
        foreach ($request->employees as $index => $employeeData) {
            try {
                \Log::info('Processing row ' . ($index + 2) . ': ' . json_encode($employeeData));
                
                // Skip if required fields are empty
                if (empty($employeeData['first_name']) || empty($employeeData['last_name'])) {
                    $errors[] = "Row " . ($index + 2) . ": First Name and Last Name are required";
                    continue;
                }

                // Skip if office or employment status is missing from Excel
                if (empty($employeeData['OFFICE'])) {
                    $errors[] = "Row " . ($index + 2) . ": OFFICE column is required";
                    continue;
                }

                if (empty($employeeData['employment_status'])) {
                    $errors[] = "Row " . ($index + 2) . ": EMPLOYMENT STATUS column is required";
                    continue;
                }

                // Clean and standardize data
                $firstName = trim(preg_replace('/\s+/', ' ', $employeeData['first_name']));
                $middleName = trim(preg_replace('/\s+/', ' ', $employeeData['middle_name'] ?? ''));
                $lastName = trim(preg_replace('/\s+/', ' ', $employeeData['last_name']));
                $suffix = trim(preg_replace('/\s+/', ' ', $employeeData['suffix'] ?? ''));
                $position = trim(preg_replace('/\s+/', ' ', $employeeData['position'] ?? ''));
                
                // Standardize capitalization
                $firstName = ucwords(strtolower($firstName));
                $middleName = ucwords(strtolower($middleName));
                $lastName = ucwords(strtolower($lastName));
                $suffix = strtoupper($suffix);
                $position = ucwords(strtolower($position));
                
                // Map office name to ID (create if doesn't exist)
                $officeId = null;
                $officeName = trim($employeeData['OFFICE'] ?? '');
                
                if (!empty($officeName)) {
                    try {
                        // Check if office exists
                        $existingOffice = \DB::table('office_assigned')
                            ->where('name', $officeName)
                            ->first();
                        
                        if ($existingOffice) {
                            $officeId = $existingOffice->id;
                        } else {
                            // Create new office from Excel data
                            $officeId = \DB::table('office_assigned')->insertGetId([
                                'name' => $officeName,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    } catch (\Exception $e) {
                        // Log error but continue with null (will fail validation if required)
                        \Log::error('Error processing office: ' . $e->getMessage());
                    }
                }

                // Map employment status name to ID (create if doesn't exist)
                $statusId = null;
                $statusName = trim($employeeData['employment_status'] ?? '');
                
                if (!empty($statusName)) {
                    try {
                        // Check if employment status exists
                        $existingStatus = \DB::table('employment_statuses')
                            ->where('name', $statusName)
                            ->first();
                        
                        if ($existingStatus) {
                            $statusId = $existingStatus->id;
                        } else {
                            // Create new employment status from Excel data
                            $statusId = \DB::table('employment_statuses')->insertGetId([
                                'name' => $statusName,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    } catch (\Exception $e) {
                        // Log error but continue with null (will fail validation if required)
                        \Log::error('Error processing employment status: ' . $e->getMessage());
                    }
                }
                
                $finalLastName = $lastName ?: 'UNKNOWN';
                $contractType = trim($employeeData['contract_type'] ?? 'Regular');

                // Prepare employee data
                $employeeUpdateData = [
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $finalLastName,
                    'suffix' => trim($employeeData['suffix'] ?? ''),
                    'sex' => trim($employeeData['sex'] ?? ''),
                    'office_assigned_id' => $officeId,
                    'employment_status_id' => $statusId,
                    'position' => trim($employeeData['position'] ?? ''),
                    'date_started' => $employeeData['date_started'] ?? null,
                    'date_resigned' => $employeeData['date_resigned'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Check if employee exists (simplified check)
                $existingEmployee = \DB::table('employees')
                    ->where('first_name', $firstName)
                    ->where('last_name', $lastName)
                    ->first();

                if ($existingEmployee) {
                    // Mark for update
                    $employeesToUpdate[] = [
                        'id' => $existingEmployee->id,
                        'data' => $employeeUpdateData
                    ];
                    $updatedCount++;
                } else {
                    // Add to bulk insert
                    $employeesToInsert[] = $employeeUpdateData;
                    $importedCount++;
                }
                
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        // Perform bulk operations
        \Log::info('About to perform bulk operations');
        \Log::info('Employees to insert: ' . count($employeesToInsert));
        \Log::info('Employees to update: ' . count($employeesToUpdate));
        \Log::info('Errors: ' . count($errors));
        
        if (!empty($employeesToInsert)) {
            \Log::info('Inserting employees: ' . json_encode($employeesToInsert));
            \DB::table('employees')->insert($employeesToInsert);
            \Log::info('Successfully inserted ' . count($employeesToInsert) . ' employees');
        }
        
        if (!empty($employeesToUpdate)) {
            \Log::info('Updating employees: ' . json_encode($employeesToUpdate));
            foreach ($employeesToUpdate as $update) {
                \DB::table('employees')
                    ->where('id', $update['id'])
                    ->update($update['data']);
            }
            \Log::info('Successfully updated ' . count($employeesToUpdate) . ' employees');
        }

        // Re-enable foreign key checks
        \DB::statement('PRAGMA foreign_keys = ON');
        
        $finalCount = Employee::count();
        \Log::info('Final employee count: ' . $finalCount);
        
        $message = "Import completed! ";
        if ($importedCount > 0) {
            $message .= "New employees: {$importedCount}. ";
        }
        if ($updatedCount > 0) {
            $message .= "Updated employees: {$updatedCount}. ";
        }
        $message .= "Total employees: {$finalCount}";
        
        if (!empty($errors)) {
            $message .= " Errors: " . count($errors);
            \Log::error('Import errors: ' . json_encode($errors));
        }
        
        \Log::info('Import message: ' . $message);
        
        if (!empty($errors)) {
            $message .= ". Errors: " . implode(', ', $errors);
            return back()->with('error', $message);
        }
        
        return back()->with('success', $message);
        
        } catch (\Exception $e) {
            \Log::error('Import error: ' . $e->getMessage());
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'sex' => 'nullable|string|max:10',
            'position' => 'nullable|string|max:255',
            'office_assigned_id' => 'required|exists:office_assigned,id',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'date_started' => 'nullable|date',
            'date_resigned' => 'nullable|date|after_or_equal:date_started',
        ]);

        $employee = Employee::create($validated);

        // Create initial contract for data consistency
        Contract::create([
            'employee_id' => $employee->id,
            'contract_type' => 'Regular',
            'start_date' => $validated['date_started'] ?? now(),
            'end_date' => $validated['date_resigned'] ?? null,
            'status' => $validated['date_resigned'] ? 'Expired' : 'Active',
            'notes' => 'Initial contract from manual entry'
        ]);

        // Create initial assignment for data consistency
        Assignment::create([
            'employee_id' => $employee->id,
            'office_assigned_id' => $validated['office_assigned_id'],
            'start_date' => $validated['date_started'] ?? now(),
            'end_date' => $validated['date_resigned'] ?? null,
            'position' => $validated['position'] ?? null,
            'notes' => 'Initial assignment from manual entry'
        ]);

        return redirect()->route('employees.index')
            ->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'sex' => 'nullable|string|max:10',
            'position' => 'nullable|string|max:255',
            'office_assigned_id' => 'required|exists:office_assigned,id',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'date_started' => 'nullable|date',
            'date_resigned' => 'nullable|date|after_or_equal:date_started',
        ]);

        // Check for section change and update assignment history
        if ($employee->office_assigned_id != $validated['office_assigned_id']) {
            // Close current assignment
            Assignment::where('employee_id', $employee->id)
                ->whereNull('end_date')
                ->update(['end_date' => now()]);

            // Create new assignment
            Assignment::create([
                'employee_id' => $employee->id,
                'office_assigned_id' => $validated['office_assigned_id'],
                'start_date' => now(),
                'end_date' => $validated['date_resigned'] ?? null,
                'position' => $validated['position'] ?? null,
                'notes' => 'Department change during update'
            ]);
        }

        // Check for resignation
        if (!empty($validated['date_resigned']) && empty($employee->date_resigned)) {
            // Close active contract
            Contract::where('employee_id', $employee->id)
                ->where('status', 'Active')
                ->update([
                    'status' => 'Expired',
                    'end_date' => $validated['date_resigned']
                ]);

            // Create resignation record
            Resignation::create([
                'employee_id' => $employee->id,
                'resignation_date' => $validated['date_resigned'],
                'reason' => 'Resigned',
                'notes' => 'Resigned during update'
            ]);

            $validated['is_archive'] = true;
            $validated['archived_date'] = now();
        }

        $employee->update($validated);

        return redirect()->route('employees.index')
            ->with('success', 'Employee updated successfully.');
    }

    public function archive(Request $request, Employee $employee)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        // Check if employee can be archived
        $archivability = $employee->archivability_status;
        
        if ($archivability['status'] === 'active') {
            return redirect()->route('employees.index')
                ->with('error', $archivability['message']);
        }

        if ($archivability['status'] === 'archived') {
            return redirect()->route('employees.index')
                ->with('error', $archivability['message']);
        }

        $employee->update([
            'is_archive' => true,
            'archived_at' => now(),
            'archived_reason' => $request->reason,
        ]);

        ActivityLog::log($employee, 'archived', "Employee archived: {$request->reason}");
        
        EmployeeTimeline::createEvent(
            $employee,
            'archived',
            'Employee Archived',
            "Employee was archived: {$request->reason}",
            now()
        );

        return redirect()->route('employees.index')
            ->with('success', 'Employee archived successfully.');
    }

    public function restore(Employee $employee)
    {
        $employee->update([
            'is_archive' => false,
            'archived_at' => null,
            'archived_reason' => null,
        ]);

        ActivityLog::log($employee, 'restored', 'Employee restored from archive');
        
        EmployeeTimeline::createEvent(
            $employee,
            'restored',
            'Employee Restored',
            'Employee was restored from archive',
            now()
        );

        return redirect()->route('employees.index')
            ->with('success', 'Employee restored successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->route('employees.index')
            ->with('success', 'Employee deleted successfully.');
    }
}
