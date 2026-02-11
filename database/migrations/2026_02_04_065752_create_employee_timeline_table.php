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
        Schema::create('employee_timeline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('event_type'); // hired, transferred, promoted, resigned, rehired, contract_change, etc.
            $table->string('event_title');
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->foreignId('related_id')->nullable(); // For contracts, assignments, etc.
            $table->string('related_type')->nullable(); // Contract, Assignment, etc.
            $table->timestamps();
            
            // Indexes for performance
            $table->index('employee_id');
            $table->index('event_type');
            $table->index('event_date');
            $table->index(['related_type', 'related_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_timeline');
    }
};
