<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            if (!Schema::hasColumn('donations', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('donations', 'declined_at')) {
                $table->timestamp('declined_at')->nullable()->after('verified_at');
            }
            if (!Schema::hasColumn('donations', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('declined_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['verified_at', 'declined_at', 'admin_notes']);
        });
    }
};
