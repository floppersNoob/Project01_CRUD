<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeTimeline extends Model
{
    protected $table = 'employee_timeline';
    
    protected $fillable = [
        'employee_id',
        'event_type',
        'event_title',
        'description',
        'event_date',
        'old_values',
        'new_values',
        'related_id',
        'related_type',
    ];

    protected $casts = [
        'event_date' => 'date',
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Create a timeline event
     */
    public static function createEvent($employee, string $eventType, string $title, string $description = null, $eventDate = null, array $oldValues = null, array $newValues = null, $relatedId = null, $relatedType = null)
    {
        return static::create([
            'employee_id' => $employee->id,
            'event_type' => $eventType,
            'event_title' => $title,
            'description' => $description,
            'event_date' => $eventDate ?? now(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'related_id' => $relatedId,
            'related_type' => $relatedType,
        ]);
    }
}
