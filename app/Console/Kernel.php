<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Daily database backup at 2 AM
        $schedule->command('app:backup-database')
            ->dailyAt('02:00')
            ->withoutOverlapping()
            ->runInBackground();
        
        // Backup on application startup (check every hour)
        $schedule->command('app:backup-database --force')
            ->hourly()
            ->when(function () {
                $backupDir = storage_path('app/backups');
                $latestBackup = glob($backupDir . '/dpwh_backup_*.sqlite.gz');
                
                // Force backup on startup if no recent backups exist
                if (empty($latestBackup)) {
                    return true;
                }
                
                $latestFile = $latestBackup[0];
                $hoursSinceBackup = (time() - filemtime($latestFile)) / 3600;
                
                return $hoursSinceBackup > 24; // Force backup if older than 24 hours
            })
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
