<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            'Human Resources',
            'Information Technology',
            'Finance',
            'Operations',
            'Marketing',
            'Administration',
        ];

        foreach ($sections as $section) {
            Section::create(['name' => $section]);
        }
    }
}
