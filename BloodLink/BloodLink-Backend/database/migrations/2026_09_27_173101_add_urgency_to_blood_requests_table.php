<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->string('urgency_level')->default('routine')->after('status'); // critical_icu, urgent_surgery, routine
            $table->integer('urgency_score')->default(10)->after('urgency_level'); // Calculated 1-100 score
            $table->integer('needed_within_hours')->default(24)->after('urgency_score');
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropColumn(['urgency_level', 'urgency_score', 'needed_within_hours']);
        });
    }
};
