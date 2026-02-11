<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'sex',
        'office_assigned_id',
        'employment_status_id',
        'position',
        'date_started',
        'date_resigned',
        'is_archive',
        'archived_date',
        'archived_at',
        'archived_reason',
        'photo_path',
        'length_of_service',
    ];

    protected $casts = [
        'date_started' => 'date',
        'date_resigned' => 'date',
        'archived_date' => 'date',
        'archived_at' => 'datetime',
        'is_archive' => 'boolean'
    ];

    public function officeAssigned()
    {
        return $this->belongsTo(Section::class);
    }

    public function employmentStatus()
    {
        return $this->belongsTo(EmploymentStatus::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function resignations()
    {
        return $this->hasMany(Resignation::class);
    }

    public function timeline()
    {
        return $this->hasMany(EmployeeTimeline::class)->orderBy('event_date', 'desc');
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    public function currentContract()
    {
        return $this->hasOne(Contract::class)->where('status', 'Active');
    }

    public function currentAssignment()
    {
        return $this->hasOne(Assignment::class)->whereNull('end_date');
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->middle_name} {$this->last_name}";
    }

    public function getLengthOfServiceAttribute()
    {
        if (!$this->date_started) {
            return 'N/A';
        }

        $startDate = new \DateTime($this->date_started);
        $currentDate = new \DateTime();
        
        // If resigned, use resigned date as end date
        if ($this->date_resigned) {
            $currentDate = new \DateTime($this->date_resigned);
        }

        $interval = $startDate->diff($currentDate);
        
        // Format the result
        $years = $interval->y;
        $months = $interval->m;
        $days = $interval->d;
        
        $parts = [];
        if ($years > 0) {
            $parts[] = $years . ' year' . ($years > 1 ? 's' : '');
        }
        if ($months > 0) {
            $parts[] = $months . ' month' . ($months > 1 ? 's' : '');
        }
        if ($days > 0 && count($parts) < 2) {
            $parts[] = $days . ' day' . ($days > 1 ? 's' : '');
        }
        
        return empty($parts) ? '0 days' : implode(', ', $parts);
    }

    public function getEmploymentStatusBadgeAttribute()
    {
        if ($this->date_resigned) {
            return [
                'label' => 'Resigned',
                'color' => 'red'
            ];
        }
        
        if ($this->is_archive) {
            return [
                'label' => 'Archived',
                'color' => 'gray'
            ];
        }
        
        $statusName = $this->employmentStatus->name ?? 'Unknown';
        
        return match($statusName) {
            'Regular' => ['label' => 'Active', 'color' => 'green'],
            'Probationary' => ['label' => 'Probationary', 'color' => 'yellow'],
            'Contractual' => ['label' => 'Contract', 'color' => 'blue'],
            'Part-time' => ['label' => 'Part-time', 'color' => 'purple'],
            'Consultant' => ['label' => 'Consultant', 'color' => 'indigo'],
            default => ['label' => $statusName, 'color' => 'gray']
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_archive', false)->whereNull('date_resigned');
    }

    public function scopeByGlobalSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('position', 'like', "%{$search}%")
              ->orWhereHas('officeAssigned', function($sectionQuery) use ($search) {
                  $sectionQuery->where('name', 'like', "%{$search}%");
              });
        });
    }

    public function cleanData()
    {
        $this->first_name = trim(preg_replace('/\s+/', ' ', $this->first_name));
        $this->middle_name = trim(preg_replace('/\s+/', ' ', $this->middle_name));
        $this->last_name = trim(preg_replace('/\s+/', ' ', $this->last_name));
        $this->suffix = trim(preg_replace('/\s+/', ' ', $this->suffix));
        $this->position = trim(preg_replace('/\s+/', ' ', $this->position));
        
        // Standardize capitalization
        $this->first_name = ucwords(strtolower($this->first_name));
        $this->middle_name = ucwords(strtolower($this->middle_name));
        $this->last_name = ucwords(strtolower($this->last_name));
        $this->suffix = strtoupper($this->suffix);
        $this->position = ucwords(strtolower($this->position));
        
        return $this;
    }

    public static function findDuplicates($firstName, $lastName, $middleName = null, $suffix = null)
    {
        return static::where(function($query) use ($firstName, $lastName, $middleName, $suffix) {
            $query->where('first_name', $firstName)
                  ->where('last_name', $lastName);
                  
            if ($middleName) {
                $query->where('middle_name', $middleName);
            }
            
            if ($suffix) {
                $query->where('suffix', $suffix);
            }
        })->get();
    }

    public function canBeArchived()
    {
        // Employee can be archived if they are resigned or already archived
        return $this->date_resigned !== null || $this->is_archive;
    }

    public function getArchivabilityStatusAttribute()
    {
        if ($this->is_archive) {
            return ['status' => 'archived', 'message' => 'Already archived'];
        }
        
        if ($this->date_resigned) {
            return ['status' => 'archivable', 'message' => 'Can be archived'];
        }
        
        return ['status' => 'active', 'message' => 'Must be resigned first'];
    }

    protected static function booted()
    {
        static::created(function ($employee) {
            ActivityLog::log($employee, 'created', 'Employee record created');
            EmployeeTimeline::createEvent(
                $employee, 
                'hired', 
                'Employee Hired', 
                "{$employee->full_name} was hired as {$employee->position}",
                $employee->date_started
            );
        });

        static::updated(function ($employee) {
            $changes = $employee->getDirty();
            
            if (!empty($changes)) {
                ActivityLog::log($employee, 'updated', 'Employee record updated', $employee->getOriginal(), $changes);
                
                // Create timeline events for significant changes
                if (isset($changes['office_assigned_id'])) {
                    $oldSection = Section::find($employee->getOriginal('office_assigned_id'));
                    $newSection = Section::find($changes['office_assigned_id']);
                    
                    EmployeeTimeline::createEvent(
                        $employee,
                        'transferred',
                        'Department Transfer',
                        "Transferred from {$oldSection->name} to {$newSection->name}",
                        now(),
                        ['office' => $oldSection->name],
                        ['office' => $newSection->name]
                    );
                }
                
                if (isset($changes['position'])) {
                    EmployeeTimeline::createEvent(
                        $employee,
                        'promoted',
                        'Position Change',
                        "Position changed from {$employee->getOriginal('position')} to {$changes['position']}",
                        now(),
                        ['position' => $employee->getOriginal('position')],
                        ['position' => $changes['position']]
                    );
                }
            }
        });

        static::deleted(function ($employee) {
            ActivityLog::log($employee, 'deleted', 'Employee record deleted');
        });
    }
}
