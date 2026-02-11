<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Section;
use App\Models\EmploymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuickVerifyController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $showArchived = $request->get('archived', false);

        $query = Employee::with(['officeAssigned', 'employmentStatus', 'currentAssignment'])
            ->when($showArchived, function ($query) {
                return $query->withTrashed();
            })
            ->when($search, function ($query, $search) {
                return $query->byGlobalSearch($search);
            });

        if (!$showArchived) {
            $query->active();
        }

        $employees = $query->orderBy('last_name')->orderBy('first_name')->take(20)->get();

        return Inertia::render('User/QuickVerify', [
            'employees' => $employees->map(function ($employee) {
                // Get current position from assignment if not set on employee
                $position = $employee->position;
                if (!$position && $employee->currentAssignment) {
                    $position = $employee->currentAssignment->position;
                }
                
                return [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'position' => $position,
                    'officeAssigned' => $employee->officeAssigned->name ?? 'N/A',
                    'status_badge' => $employee->employment_status_badge,
                    'date_started' => $employee->date_started?->format('M d, Y'),
                    'photo_path' => $employee->photo_path,
                ];
            }),
            'search' => $search,
            'showArchived' => $showArchived,
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->get('search', '');
        $showArchived = $request->get('archived', false);

        $query = Employee::with(['officeAssigned', 'employmentStatus', 'currentAssignment'])
            ->when($showArchived, function ($query) {
                return $query->withTrashed();
            })
            ->when($search, function ($query, $search) {
                return $query->byGlobalSearch($search);
            });

        if (!$showArchived) {
            $query->active();
        }

        $employees = $query->orderBy('last_name')->orderBy('first_name')->take(20)->get();

        return response()->json([
            'employees' => $employees->map(function ($employee) {
                // Get current position from assignment if not set on employee
                $position = $employee->position;
                if (!$position && $employee->currentAssignment) {
                    $position = $employee->currentAssignment->position;
                }
                
                return [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'position' => $position,
                    'officeAssigned' => $employee->officeAssigned->name ?? 'N/A',
                    'status_badge' => $employee->employment_status_badge,
                    'date_started' => $employee->date_started?->format('M d, Y'),
                    'photo_path' => $employee->photo_path,
                ];
            }),
        ]);
    }
}
