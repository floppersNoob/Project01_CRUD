<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employment_statuses', function (Blueprint $table) {
            // Check if status column exists and rename it to name
            if (Schema::hasColumn('employment_statuses', 'status') && !Schema::hasColumn('employment_statuses', 'name')) {
                $table->renameColumn('status', 'name');
            }
            
            // Add description column if it doesn't exist
            if (!Schema::hasColumn('employment_statuses', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            
            // Add archive columns if they don't exist
            if (!Schema::hasColumn('employment_statuses', 'is_archive')) {
                $table->boolean('is_archive')->default(false)->after('description');
            }
            
            if (!Schema::hasColumn('employment_statuses', 'archived_date')) {
                $table->timestamp('archived_date')->nullable()->after('is_archive');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employment_statuses', function (Blueprint $table) {
            $table->dropColumn(['description', 'is_archive', 'archived_date']);
            if (Schema::hasColumn('employment_statuses', 'name')) {
                $table->renameColumn('name', 'status');
            }
        });
    }
};
