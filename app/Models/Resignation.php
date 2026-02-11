<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resignation extends Model
{
    protected $fillable = [
        'employee_id',
        'resignation_date',
        'reason',
        'notes'
    ];

    protected $casts = [
        'resignation_date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    protected static function booted()
    {
        static::created(function ($resignation) {
            $employee = $resignation->employee;
            
            // Auto-archive employee when resignation is recorded
            $employee->update([
                'date_resigned' => $resignation->resignation_date,
                'is_archive' => true,
                'archived_at' => now(),
                'archived_reason' => "Resigned: {$resignation->reason}"
            ]);

            // Close active contracts
            Contract::where('employee_id', $employee->id)
                ->where('status', 'Active')
                ->update([
                    'status' => 'Expired',
                    'end_date' => $resignation->resignation_date
                ]);

            // Close active assignments
            Assignment::where('employee_id', $employee->id)
                ->whereNull('end_date')
                ->update(['end_date' => $resignation->resignation_date]);

            // Log the activity
            ActivityLog::log($employee, 'resigned', "Employee resigned: {$resignation->reason}");
            
            // Create timeline event
            EmployeeTimeline::createEvent(
                $employee,
                'resigned',
                'Employee Resigned',
                "Employee resigned: {$resignation->reason}",
                $resignation->resignation_date
            );
        });
    }
}
