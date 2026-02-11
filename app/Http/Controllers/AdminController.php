<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Section;
use App\Models\EmploymentStatus;
use App\Models\Contract;
use App\Models\Assignment;
use App\Models\Resignation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('is_archive', false)->count();
        $archivedEmployees = Employee::where('is_archive', true)->count();
        
        $recentEmployees = Employee::with(['officeAssigned', 'employmentStatus', 'currentAssignment'])
            ->where('is_archive', false)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($employee) {
                // Get current position from assignment if not set on employee
                $position = $employee->position;
                if (!$position && $employee->currentAssignment) {
                    $position = $employee->currentAssignment->position;
                }
                
                return [
                    'id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'middle_name' => $employee->middle_name,
                    'position' => $position,
                    'section' => $employee->officeAssigned->name ?? 'N/A',
                    'employment_status' => $employee->employmentStatus->name ?? 'N/A',
                    'date_started' => $employee->date_started,
                    'created_at' => $employee->created_at,
                ];
            });
            
        $employeesBySection = Employee::with('officeAssigned')
            ->where('is_archive', false)
            ->get()
            ->groupBy('officeAssigned.name')
            ->map(function ($employees) {
                return $employees->count();
            });

        // Get history statistics for dashboard
        $historyStats = [
            'totalContracts' => Contract::count(),
            'totalAssignments' => Assignment::count(),
            'totalResignations' => Resignation::count(),
            'activeRecords' => Contract::where('status', 'Active')->count() + 
                              Assignment::whereNull('end_date')->count(),
        ];

        // Get recent history records for dashboard display
        $recentHistory = collect();

        // Get recent contracts
        $recentContracts = Contract::with(['employee.officeAssigned'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($contract) {
                return [
                    'id' => $contract->id,
                    'type' => 'Contract',
                    'employee_name' => $contract->employee->first_name . ' ' . $contract->employee->last_name,
                    'section' => $contract->employee->officeAssigned->name ?? 'N/A',
                    'details' => $contract->contract_type,
                    'start_date' => $contract->start_date,
                    'end_date' => $contract->end_date,
                    'status' => $contract->status,
                    'created_at' => $contract->created_at,
                ];
            });

        // Get recent assignments
        $recentAssignments = Assignment::with(['employee.officeAssigned', 'officeAssigned'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'type' => 'Assignment',
                    'employee_name' => $assignment->employee->first_name . ' ' . $assignment->employee->last_name,
                    'section' => $assignment->employee->officeAssigned->name ?? 'N/A',
                    'details' => ($assignment->officeAssigned->name ?? 'N/A') . ($assignment->position ? ' - ' . $assignment->position : ''),
                    'start_date' => $assignment->start_date,
                    'end_date' => $assignment->end_date,
                    'status' => $assignment->end_date ? 'Expired' : 'Active',
                    'created_at' => $assignment->created_at,
                ];
            });

        // Get recent resignations
        $recentResignations = Resignation::with(['employee.officeAssigned'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($resignation) {
                return [
                    'id' => $resignation->id,
                    'type' => 'Resignation',
                    'employee_name' => $resignation->employee->first_name . ' ' . $resignation->employee->last_name,
                    'section' => $resignation->employee->officeAssigned->name ?? 'N/A',
                    'details' => $resignation->reason ?? 'Resigned',
                    'start_date' => $resignation->resignation_date,
                    'end_date' => null,
                    'status' => 'Resigned',
                    'created_at' => $resignation->created_at,
                ];
            });

        // Combine and sort recent history
        $recentHistory = collect($recentContracts->toArray())
            ->merge(collect($recentAssignments->toArray()))
            ->merge(collect($recentResignations->toArray()))
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'archivedEmployees' => $archivedEmployees,
            ],
            'recentEmployees' => $recentEmployees,
            'employeesBySection' => $employeesBySection,
            'sections' => Section::all(),
            'employmentStatuses' => EmploymentStatus::all(),
            'historyStats' => $historyStats,
            'recentHistory' => $recentHistory,
        ]);
    }
}
