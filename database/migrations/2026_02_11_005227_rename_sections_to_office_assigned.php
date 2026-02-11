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
        // Rename the table
        Schema::rename('sections', 'office_assigned');
        
        // Update foreign key references in employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('section_id', 'office_assigned_id');
        });
        
        // Update foreign key references in assignments table
        Schema::table('assignments', function (Blueprint $table) {
            $table->renameColumn('section_id', 'office_assigned_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the table rename
        Schema::rename('office_assigned', 'sections');
        
        // Reverse the column renames
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('office_assigned_id', 'section_id');
        });
        
        Schema::table('assignments', function (Blueprint $table) {
            $table->renameColumn('office_assigned_id', 'section_id');
        });
    }
};
