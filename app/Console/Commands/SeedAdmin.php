<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:seed-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding admin user...');
        
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\AdminSeeder'
        ]);
        
        $this->info('✅ Admin seeder completed!');
        $this->info('📧 Email: admin@dpwh');
        $this->info('🔑 Password: admin');
        
        return 0;
    }
}
