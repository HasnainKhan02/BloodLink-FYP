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
    Schema::table('blood_requests', function (Blueprint $table) {
        if (!Schema::hasColumn('blood_requests', 'age')) {
            $table->integer('age')->nullable()->after('patient_name');
        }
        if (!Schema::hasColumn('blood_requests', 'units_needed')) {
            $table->integer('units_needed')->default(1)->after('blood_type');
        }
        if (!Schema::hasColumn('blood_requests', 'city')) {
            $table->string('city')->nullable()->after('hospital_name');
        }
    });
}
    /**
     * Reverse the migrations.
     */
public function down(): void
{
    Schema::table('blood_requests', function (Blueprint $table) {
        $table->dropColumn(['age', 'units_needed', 'city']);
    });
}
};
