<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('blood_requests', 'age')) {
                $table->integer('age')->nullable()->after('patient_name');
            }
            if (!Schema::hasColumn('blood_requests', 'city')) {
                $table->string('city')->nullable()->after('hospital_name');
            }
            if (!Schema::hasColumn('blood_requests', 'units_needed')) {
                $table->integer('units_needed')->default(1)->after('blood_type');
            }
            if (!Schema::hasColumn('blood_requests', 'contact_phone')) {
                $table->string('contact_phone')->nullable()->after('address');
            }
            if (!Schema::hasColumn('blood_requests', 'proof_document')) {
                $table->string('proof_document')->nullable()->after('longitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropColumn(['age', 'city', 'units_needed', 'contact_phone', 'proof_document']);
        });
    }
};
