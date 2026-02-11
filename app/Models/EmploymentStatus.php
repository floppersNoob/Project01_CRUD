<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploymentStatus extends Model
{
    protected $table = 'employment_statuses';
    
    protected $fillable = [
        'name',
        'description',
        'is_archive',
        'archived_date',
    ];

    protected $attributes = [
        'is_archive' => false,
    ];

    protected $casts = [
        'is_archive' => 'boolean',
        'archived_date' => 'datetime',
    ];
}
