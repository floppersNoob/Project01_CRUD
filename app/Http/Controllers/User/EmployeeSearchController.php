<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Section;
use App\Models\EmploymentStatus;
use App\Models\Contract;
use App\Models\Assignment;
use App\Models\Resignation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EmployeeSearchController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $officeAssigned = $request->get('section', '');
        $status = $request->get('status', '');
        $position = $request->get('position', '');
        $showArchived = $request->get('archived', false);
        $page = $request->get('page', 1);

        \Log::info('EmployeeSearch filter params: ' . json_encode([
            'search' => $search,
            'officeAssigned' => $officeAssigned,
            'status' => $status,
            'position' => $position
        ]));

        // Get all employees with their relationships and current position
        $query = Employee::with(['officeAssigned', 'employmentStatus', 'currentAssignment']);

        // Apply filters
        $query->when($search, function ($query, $search) {
            return $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%')
                  ->orWhere('middle_name', 'like', '%' . $search . '%')
                  ->orWhere(DB::raw("LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name)"), 'like', strtolower('%' . $search . '%'))
                  ->orWhere('position', 'like', '%' . $search . '%')
                  ->orWhereHas('officeAssigned', function ($officeAssignedQuery) use ($search) {
                      $officeAssignedQuery->where('name', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('currentAssignment', function ($assignmentQuery) use ($search) {
                      $assignmentQuery->where('position', 'like', '%' . $search . '%');
                  });
            })->orderByRaw("CASE 
                WHEN LOWER(first_name) = LOWER('{$search}') THEN 1 
                WHEN LOWER(last_name) = LOWER('{$search}') THEN 2
                WHEN LOWER(first_name) LIKE LOWER('{$search}%') THEN 3 
                WHEN LOWER(last_name) LIKE LOWER('{$search}%') THEN 4 
                WHEN LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name) LIKE LOWER('%{$search}%') THEN 5 
                WHEN LOWER(position) LIKE LOWER('%{$search}%') THEN 6
                ELSE 7 
            END");
        });

        $query->when($officeAssigned, function ($query, $officeAssigned) {
            \Log::info('Applying office filter: ' . $officeAssigned);
            $query->where('office_assigned_id', $officeAssigned);
            \Log::info('SQL Query: ' . $query->toSql());
            \Log::info('SQL Bindings: ' . json_encode($query->getBindings()));
            return $query;
        });

        $query->when($status, function ($query, $status) {
            return $query->where('employment_status_id', $status);
        });

        $query->when($position, function ($query, $position) {
            return $query->where(function ($q) use ($position) {
                $q->where('position', 'like', '%' . $position . '%')
                  ->orWhereHas('currentAssignment', function ($assignmentQuery) use ($position) {
                      $assignmentQuery->where('position', 'like', '%' . $position . '%');
                  });
            });
        });

        $query->when($showArchived, function ($query) {
            return $query->where(function ($q) {
                $q->where('is_archive', true)
                  ->orWhereNotNull('date_resigned');
            });
        }, function ($query) {
            // Hide resigned employees from main display, but include them when searching
            if (request()->get('search')) {
                return $query->where(function ($q) {
                    $q->where('is_archive', false)
                      ->orWhereNotNull('date_resigned');
                });
            } else {
                return $query->where('is_archive', false)->whereNull('date_resigned');
            }
        });

        // Apply ordering
        if (!$search) {
            $query->orderBy('last_name')->orderBy('first_name');
        }

        // Use server-side pagination with 12 items per page
        $employees = $query->paginate(12, ['*'], 'page', $page);
        
        \Log::info('EmployeeSearch results: ' . $employees->total() . ' total employees found');

        // Transform the collection to include current position from assignments
        $employees->getCollection()->transform(function ($employee) {
            // Get current position from assignment if not set on employee
            if (!$employee->position && $employee->currentAssignment) {
                $employee->position = $employee->currentAssignment->position;
            }
            return $employee;
        });

        // Get all officeAssigneds and employment statuses for filters
        $officeAssigneds = Section::where('is_archive', false)->orderBy('name')->get();
        $employmentStatuses = EmploymentStatus::where('is_archive', false)->orderBy('name')->get();

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

        return Inertia::render('User/EmployeeSearch', [
            'employees' => $employees,
            'offices' => $officeAssigneds,
            'employmentStatuses' => $employmentStatuses,
            'positions' => $positions,
        ]);
    }

    public function show($id)
    {
        $employee = Employee::with([
            'officeAssigned', 
            'employmentStatus',
            'currentAssignment',
            'contracts' => function($query) {
                $query->orderBy('start_date', 'desc');
            },
            'assignments' => function($query) {
                $query->orderBy('start_date', 'desc');
            },
            'assignments.officeAssigned',
            'resignations' => function($query) {
                $query->orderBy('resignation_date', 'desc');
            }
        ])->findOrFail($id);

        // Get current position from assignment if not set on employee
        if (!$employee->position && $employee->currentAssignment) {
            $employee->position = $employee->currentAssignment->position;
        }

        // Check if request wants JSON (for modal) or regular page view
        if (request()->wantsJson() || request->ajax()) {
            return response()->json([
                'employee' => $employee
            ]);
        }

        return Inertia::render('User/EmployeeDetails', [
            'employee' => $employee,
        ]);
    }

    public function suggest(Request $request)
    {
        $term = trim($request->get('q', ''));
        if (strlen($term) < 1) {
            return response()->json([]);
        }

        // Build a comprehensive search that finds all employees matching the search term
        $query = Employee::query()
            ->with(['officeAssigned', 'employmentStatus', 'currentAssignment'])
            ->where(function ($q) use ($term) {
                // Search in individual name fields
                $q->where('first_name', 'like', "%{$term}%")
                  ->orWhere('last_name', 'like', "%{$term}%")
                  ->orWhere('middle_name', 'like', "%{$term}%")
                  // Search in full name using SQLite-compatible concatenation
                  ->orWhere(DB::raw("LOWER(first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name)"), 'like', strtolower("%{$term}%"))
                  // Search in position
                  ->orWhere('position', 'like', "%{$term}%")
                  // Search in officeAssigned name
                  ->orWhereHas('officeAssigned', function ($officeAssignedQuery) use ($term) {
                      $officeAssignedQuery->where('name', 'like', "%{$term}%");
                  })
                  // Search in current assignment position
                  ->orWhereHas('currentAssignment', function ($assignmentQuery) use ($term) {
                      $assignmentQuery->where('position', 'like', "%{$term}%");
                  });
            })
            ->where(function ($q) {
                // Include active employees and resigned employees in suggestions
                $q->where('is_archive', false)
                  ->orWhereNotNull('date_resigned');
            });

        // Simple ordering for better suggestions (SQLite-compatible)
        $query->orderByRaw("CASE 
            WHEN LOWER(first_name) = LOWER('{$term}') THEN 1 
            WHEN LOWER(last_name) = LOWER('{$term}') THEN 2
            WHEN LOWER(first_name) LIKE LOWER('{$term}%') THEN 3 
            WHEN LOWER(last_name) LIKE LOWER('{$term}%') THEN 4 
            ELSE 5 
        END")
        ->orderBy('last_name')
        ->orderBy('first_name')
        ->limit(12);
        
        $results = $query->get(['id', 'first_name', 'middle_name', 'last_name', 'position', 'officeAssigned_id', 'employment_status_id']);

        $data = $results->map(function ($e) {
            // Get current position from assignment if not set on employee
            $position = $e->position;
            if (!$position && $e->currentAssignment) {
                $position = $e->currentAssignment->position;
            }
            
            return [
                'id' => $e->id,
                'first_name' => $e->first_name,
                'middle_name' => $e->middle_name,
                'last_name' => $e->last_name,
                'position' => $position,
                'officeAssigned' => $e->officeAssigned ? ['name' => $e->officeAssigned->name] : null,
                'employment_status' => $e->employmentStatus ? ['name' => $e->employmentStatus->name] : null,
            ];
        });

        return response()->json($data);
    }
}
