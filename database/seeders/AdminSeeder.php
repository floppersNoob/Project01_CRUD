<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        $existingAdmin = User::where('email', 'admin@dpwh')->first();
        
        if (!$existingAdmin) {
            // Create admin user
            User::create([
                'name' => 'Administrator',
                'email' => 'admin@dpwh',
                'password' => bcrypt('admin'),
            ]);
            
            $this->command->info('✅ Admin user created successfully!');
            $this->command->info('📧 Email: admin@dpwh');
            $this->command->info('🔑 Password: admin');
        } else {
            $this->command->info('ℹ️  Admin user already exists!');
            $this->command->info('📧 Email: admin@dpwh');
            $this->command->info('🔑 Password: admin');
        }
    }
}
