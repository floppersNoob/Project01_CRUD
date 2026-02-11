<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Contract;
use App\Models\Assignment;
use App\Models\Resignation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $section = $request->get('section', '');
        $dateRange = $request->get('date_range', '');

        // Get resignation statistics
        $stats = [
            'totalResignations' => Resignation::count(),
            'thisMonthResignations' => Resignation::whereMonth('resignation_date', now()->month)
                ->whereYear('resignation_date', now()->year)
                ->count(),
            'inactiveEmployees' => Employee::where('is_archive', true)->count(),
        ];

        // Get resignation records with filtering
        $query = Resignation::with(['employee.officeAssigned', 'employee.employmentStatus', 'employee.currentAssignment'])
            ->when($search, function ($query, $search) {
                return $query->whereHas('employee', function ($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhereRaw("first_name || ' ' || COALESCE(middle_name, '') || ' ' || last_name LIKE ?", ['%' . $search . '%']);
                });
            })
            ->when($section, function ($query, $section) {
                return $query->whereHas('employee', function ($q) use ($section) {
                    $q->whereHas('officeAssigned', function ($sq) use ($section) {
                        $sq->where('id', $section);
                    });
                });
            })
            ->when($dateRange, function ($query, $dateRange) {
                $days = (int) $dateRange;
                if ($days > 0) {
                    $query->where('resignation_date', '>=', now()->subDays($days));
                }
            })
            ->orderBy('resignation_date', 'desc');

        $history = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/History', [
            'stats' => $stats,
            'history' => $history->items(),
            'pagination' => [
                'current_page' => $history->currentPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total(),
                'last_page' => $history->lastPage(),
            ],
            'filters' => [
                'search' => $search,
                'section' => $section,
                'date_range' => $dateRange,
            ],
            'sections' => \App\Models\Section::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'resignation_date' => 'required|date',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            // Create resignation record
            $resignation = Resignation::create([
                'employee_id' => $validated['employee_id'],
                'resignation_date' => $validated['resignation_date'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? '',
            ]);

            return back()->with('success', 'Resignation record created successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create resignation record: ' . $e->getMessage());
        }
    }

    public function show($type, $id)
    {
        $record = null;

        switch (strtolower($type)) {
            case 'contract':
                $record = Contract::with(['employee.section', 'employee.assignments', 'employee.resignations'])->findOrFail($id);
                break;
            case 'assignment':
                $record = Assignment::with(['employee.section', 'section', 'employee.contracts', 'employee.resignations'])->findOrFail($id);
                break;
            case 'resignation':
                $record = Resignation::with(['employee.section', 'employee.contracts', 'employee.assignments'])->findOrFail($id);
                break;
            default:
                abort(404);
        }

        return Inertia::render('Admin/HistoryDetail', [
            'record' => $record,
            'type' => $type,
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->get('type', 'all');
        $dateRange = $request->get('date_range', '');

        // Build query based on type and filters
        $data = [];

        switch ($type) {
            case 'contracts':
                $data = Contract::with(['employee.section'])
                    ->when($dateRange, function ($query, $dateRange) {
                        $days = (int) $dateRange;
                        if ($days > 0) {
                            $query->where('start_date', '>=', now()->subDays($days));
                        }
                    })
                    ->get()
                    ->map(function ($contract) {
                        return [
                            'Employee Name' => $contract->employee->first_name . ' ' . $contract->employee->last_name,
                            'Section' => $contract->employee->section->name ?? 'N/A',
                            'Contract Type' => $contract->contract_type,
                            'Start Date' => $contract->start_date,
                            'End Date' => $contract->end_date ?? 'Present',
                            'Status' => $contract->status,
                            'Notes' => $contract->notes,
                        ];
                    });
                break;

            case 'assignments':
                $data = Assignment::with(['employee.section', 'section'])
                    ->when($dateRange, function ($query, $dateRange) {
                        $days = (int) $dateRange;
                        if ($days > 0) {
                            $query->where('start_date', '>=', now()->subDays($days));
                        }
                    })
                    ->get()
                    ->map(function ($assignment) {
                        return [
                            'Employee Name' => $assignment->employee->first_name . ' ' . $assignment->employee->last_name,
                            'Section' => $assignment->employee->section->name ?? 'N/A',
                            'Department' => $assignment->section->name ?? 'N/A',
                            'Position' => $assignment->position ?? 'N/A',
                            'Start Date' => $assignment->start_date,
                            'End Date' => $assignment->end_date ?? 'Present',
                            'Notes' => $assignment->notes,
                        ];
                    });
                break;

            case 'resignations':
                $data = Resignation::with(['employee.section'])
                    ->when($dateRange, function ($query, $dateRange) {
                        $days = (int) $dateRange;
                        if ($days > 0) {
                            $query->where('resignation_date', '>=', now()->subDays($days));
                        }
                    })
                    ->get()
                    ->map(function ($resignation) {
                        return [
                            'Employee Name' => $resignation->employee->first_name . ' ' . $resignation->employee->last_name,
                            'Section' => $resignation->employee->section->name ?? 'N/A',
                            'Resignation Date' => $resignation->resignation_date,
                            'Reason' => $resignation->reason ?? 'N/A',
                            'Notes' => $resignation->notes,
                        ];
                    });
                break;

            default:
                // Export all types
                $contracts = Contract::with(['employee.section'])->get()->map(function ($contract) {
                    return [
                        'Type' => 'Contract',
                        'Employee Name' => $contract->employee->first_name . ' ' . $contract->employee->last_name,
                        'Section' => $contract->employee->section->name ?? 'N/A',
                        'Details' => $contract->contract_type,
                        'Start Date' => $contract->start_date,
                        'End Date' => $contract->end_date ?? 'Present',
                        'Status' => $contract->status,
                        'Notes' => $contract->notes,
                    ];
                });

                $assignments = Assignment::with(['employee.section', 'section'])->get()->map(function ($assignment) {
                    return [
                        'Type' => 'Assignment',
                        'Employee Name' => $assignment->employee->first_name . ' ' . $assignment->employee->last_name,
                        'Section' => $assignment->employee->section->name ?? 'N/A',
                        'Details' => ($assignment->section->name ?? 'N/A') . ($assignment->position ? ' - ' . $assignment->position : ''),
                        'Start Date' => $assignment->start_date,
                        'End Date' => $assignment->end_date ?? 'Present',
                        'Status' => $assignment->end_date ? 'Expired' : 'Active',
                        'Notes' => $assignment->notes,
                    ];
                });

                $resignations = Resignation::with(['employee.section'])->get()->map(function ($resignation) {
                    return [
                        'Type' => 'Resignation',
                        'Employee Name' => $resignation->employee->first_name . ' ' . $resignation->employee->last_name,
                        'Section' => $resignation->employee->section->name ?? 'N/A',
                        'Details' => $resignation->reason ?? 'Resigned',
                        'Start Date' => $resignation->resignation_date,
                        'End Date' => 'N/A',
                        'Status' => 'Resigned',
                        'Notes' => $resignation->notes,
                    ];
                });

                $data = $contracts->merge($assignments)->merge($resignations)->sortBy('Start Date');
        }

        // Generate CSV
        $filename = 'employee_history_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            
            if ($data->isNotEmpty()) {
                // Add CSV headers
                fputcsv($file, array_keys($data->first()));
                
                // Add data rows
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getInitials($firstName, $lastName)
    {
        return strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
    }
}
