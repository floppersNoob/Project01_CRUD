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
        Schema::table('employees', function (Blueprint $table) {
            // Add archived_at and archived_reason for enhanced archive system
            $table->timestamp('archived_at')->nullable()->after('archived_date');
            $table->text('archived_reason')->nullable()->after('archived_at');
            
            // Add indexes for search performance
            $table->index(['last_name', 'first_name']);
            $table->index('section_id');
            $table->index('employment_status_id');
            $table->index('position');
            $table->index(['is_archive', 'date_resigned']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['last_name', 'first_name']);
            $table->dropIndex(['section_id']);
            $table->dropIndex(['employment_status_id']);
            $table->dropIndex(['position']);
            $table->dropIndex(['is_archive', 'date_resigned']);
            
            $table->dropColumn(['archived_at', 'archived_reason']);
        });
    }
};
