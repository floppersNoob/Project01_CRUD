<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebugController extends Controller
{
    public function index()
    {
        // Get database counts
        $totalEmployees = DB::table('employees')->count();
        $activeEmployees = DB::table('employees')->where('is_archive', 0)->count();
        $archivedEmployees = DB::table('employees')->where('is_archive', 1)->count();
        
        $totalContracts = DB::table('contracts')->count();
        $totalAssignments = DB::table('assignments')->count();
        $totalResignations = DB::table('resignations')->count();
        
        // Get Laravel pagination data
        $employees = DB::table('employees')
            ->where('is_archive', 0)
            ->orderBy('last_name')
            ->paginate(10);
        
        return response()->json([
            'database_counts' => [
                'total_employees' => $totalEmployees,
                'active_employees' => $activeEmployees,
                'archived_employees' => $archivedEmployees,
            ],
            'history_records' => [
                'total_contracts' => $totalContracts,
                'total_assignments' => $totalAssignments,
                'total_resignations' => $totalResignations,
            ],
            'laravel_pagination' => [
                'total' => $employees->total(),
                'count' => $employees->count(),
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
            ],
            'sample_employees' => DB::table('employees')
                ->select('id', 'first_name', 'last_name', 'is_archive')
                ->where('is_archive', 0)
                ->limit(5)
                ->get(),
        ]);
    }
}
