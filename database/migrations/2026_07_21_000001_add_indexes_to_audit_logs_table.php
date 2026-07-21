<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes to the audit_logs table.
     * These cover the most common query patterns in AuditLogController::index().
     */
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Primary sort index — DESC ordering on created_at is the default sort
            $table->index('created_at', 'audit_logs_created_at_idx');

            // Covers event_type equality and LIKE prefix filters (auth.%, system.error)
            $table->index('event_type', 'audit_logs_event_type_idx');

            // Covers user_id filter lookups and the eager-load join with users table
            $table->index('user_id', 'audit_logs_user_id_idx');

            // Composite index for the most common combined filter (user + date range)
            $table->index(['user_id', 'created_at'], 'audit_logs_user_created_idx');

            // Covers IP address lookups in search queries
            $table->index('ip_address', 'audit_logs_ip_address_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_created_at_idx');
            $table->dropIndex('audit_logs_event_type_idx');
            $table->dropIndex('audit_logs_user_id_idx');
            $table->dropIndex('audit_logs_user_created_idx');
            $table->dropIndex('audit_logs_ip_address_idx');
        });
    }
};
