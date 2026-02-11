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
            $table->boolean('is_archive')->default(false)->after('description');
            $table->timestamp('archived_date')->nullable()->after('is_archive');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employment_statuses', function (Blueprint $table) {
            $table->dropColumn(['is_archive', 'archived_date']);
        });
    }
};
