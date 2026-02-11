<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-database {--force : Force backup even if recent backup exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically backup the SQLite database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $databasePath = database_path('database.sqlite');
        $backupDir = storage_path('app/backups');
        
        // Create backup directory if it doesn't exist
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Check if recent backup exists (unless --force is used)
        $latestBackup = $this->getLatestBackup($backupDir);
        if (!$this->option('force') && $latestBackup && $this->isRecentBackup($latestBackup)) {
            $this->info('Recent backup exists. Use --force to create new backup.');
            $this->info("Latest backup: {$latestBackup}");
            return 0;
        }

        // Create backup filename with timestamp
        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupFile = $backupDir . "/dpwh_backup_{$timestamp}.sqlite";

        try {
            // Copy database file
            if (!copy($databasePath, $backupFile)) {
                $this->error('Failed to create backup file.');
                return 1;
            }

            // Compress the backup
            $compressedFile = $backupFile . '.gz';
            $this->compressFile($backupFile, $compressedFile);

            // Remove uncompressed backup
            unlink($backupFile);

            // Clean old backups (keep last 30 days)
            $this->cleanOldBackups($backupDir, 30);

            $this->info("Database backup created successfully: " . basename($compressedFile));
            
            // Log the backup
            \Log::info("Database backup created", [
                'file' => basename($compressedFile),
                'size' => filesize($compressedFile),
                'timestamp' => now()
            ]);

            return 0;
        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            return 1;
        }
    }

    private function getLatestBackup($backupDir)
    {
        $files = glob($backupDir . '/dpwh_backup_*.sqlite.gz');
        if (empty($files)) {
            return null;
        }

        usort($files, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        return $files[0];
    }

    private function isRecentBackup($backupFile)
    {
        $backupTime = filemtime($backupFile);
        $hoursSinceBackup = (time() - $backupTime) / 3600;
        
        return $hoursSinceBackup < 24; // Consider backup recent if less than 24 hours old
    }

    private function compressFile($source, $destination)
    {
        $sourceFile = fopen($source, 'rb');
        $destFile = gzopen($destination, 'wb9');

        while (!feof($sourceFile)) {
            gzwrite($destFile, fread($sourceFile, 1024 * 512));
        }

        fclose($sourceFile);
        gzclose($destFile);
    }

    private function cleanOldBackups($backupDir, $daysToKeep)
    {
        $files = glob($backupDir . '/dpwh_backup_*.sqlite.gz');
        $cutoffTime = time() - ($daysToKeep * 24 * 60 * 60);

        foreach ($files as $file) {
            if (filemtime($file) < $cutoffTime) {
                unlink($file);
                $this->line("Deleted old backup: " . basename($file));
            }
        }
    }
}
