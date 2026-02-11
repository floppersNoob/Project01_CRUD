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
            // Rename status column to name for consistency
            $table->renameColumn('status', 'name');
            
            // Add description column
            $table->text('description')->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employment_statuses', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->renameColumn('name', 'status');
        });
    }
};
