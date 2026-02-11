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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('contract_type'); // JO, Regular, etc.
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null for ongoing contracts
            $table->string('status')->default('Active'); // Active, Expired, Terminated
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
