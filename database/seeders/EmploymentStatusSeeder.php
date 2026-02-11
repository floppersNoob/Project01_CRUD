<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmploymentStatus;

class EmploymentStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'Regular',
            'Probationary',
            'Contractual',
            'Part-time',
            'Consultant',
        ];

        foreach ($statuses as $status) {
            EmploymentStatus::create(['status' => $status]);
        }
    }
}
