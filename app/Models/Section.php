<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $table = 'office_assigned';
    
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
