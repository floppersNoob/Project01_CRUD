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
        // Drop existing foreign key constraints
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['office_assigned_id']);
        });
        
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['office_assigned_id']);
        });
        
        // Recreate foreign key constraints with correct table names
        Schema::table('employees', function (Blueprint $table) {
            $table->foreign('office_assigned_id')->references('id')->on('office_assigned');
        });
        
        Schema::table('assignments', function (Blueprint $table) {
            $table->foreign('office_assigned_id')->references('id')->on('office_assigned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new foreign key constraints
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['office_assigned_id']);
        });
        
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['office_assigned_id']);
        });
        
        // Recreate old foreign key constraints (pointing to sections table)
        Schema::table('employees', function (Blueprint $table) {
            $table->foreign('office_assigned_id')->references('id')->on('sections');
        });
        
        Schema::table('assignments', function (Blueprint $table) {
            $table->foreign('office_assigned_id')->references('id')->on('sections');
        });
    }
};
