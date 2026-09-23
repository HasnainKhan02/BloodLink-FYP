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
Schema::create('blood_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->string('patient_name');
            $table->string('hospital_name');
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
            $table->integer('units_required')->default(1);
            $table->enum('urgency', ['NORMAL', 'URGENT', 'CRITICAL'])->default('URGENT');
            $table->string('contact_phone');
            $table->double('latitude', 10, 8);
            $table->double('longitude', 11, 8);
            $table->string('address');
            $table->enum('status', ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_requests');
    }
};
