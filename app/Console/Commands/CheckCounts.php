<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check database counts for employees and history records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== DATABASE COUNTS ===');
        
        // Count employees
        $totalEmployees = DB::table('employees')->count();
        $activeEmployees = DB::table('employees')->where('is_archive', 0)->count();
        $archivedEmployees = DB::table('employees')->where('is_archive', 1)->count();
        
        $this->info("Total Employees: {$totalEmployees}");
        $this->info("Active Employees: {$activeEmployees}");
        $this->info("Archived Employees: {$archivedEmployees}");
        $this->newLine();
        
        // Count history records
        $totalContracts = DB::table('contracts')->count();
        $totalAssignments = DB::table('assignments')->count();
        $totalResignations = DB::table('resignations')->count();
        
        $this->info("Total Contracts: {$totalContracts}");
        $this->info("Total Assignments: {$totalAssignments}");
        $this->info("Total Resignations: {$totalResignations}");
        $this->newLine();
        
        // Show sample employee data
        $this->info('=== SAMPLE EMPLOYEES ===');
        $employees = DB::table('employees')
            ->select('id', 'first_name', 'last_name', 'email', 'is_archive')
            ->limit(5)
            ->get();
            
        foreach ($employees as $employee) {
            $archived = $employee->is_archive ? 'Yes' : 'No';
            $this->info("ID: {$employee->id}, Name: {$employee->first_name} {$employee->last_name}, Archived: {$archived}");
        }
        
        // Check for potential duplicates
        $this->newLine();
        $this->info('=== POTENTIAL DUPLICATES ===');
        
        $duplicates = DB::table('employees')
            ->select('first_name', 'last_name', DB::raw('COUNT(*) as count'))
            ->groupBy('first_name', 'last_name')
            ->havingRaw('COUNT(*) > 1')
            ->get();
            
        if ($duplicates->count() > 0) {
            $this->info('Found potential duplicates:');
            foreach ($duplicates as $dup) {
                $this->info("- {$dup->first_name} {$dup->last_name}: {$dup->count} records");
            }
        } else {
            $this->info('No duplicate names found');
        }
        
        return Command::SUCCESS;
    }
}
