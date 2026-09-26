<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('blood_requests', 'urgency')) {
                $table->string('urgency')->default('CRITICAL')->after('units_needed');
            }
            if (!Schema::hasColumn('blood_requests', 'initial_radius_km')) {
                $table->integer('initial_radius_km')->default(5)->after('urgency');
            }
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropColumn(['urgency', 'initial_radius_km']);
        });
    }
};