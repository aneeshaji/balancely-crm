<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comprehensive performance index migration.
 * Adds missing indexes to ALL core CRM tables covering the actual query patterns
 * used by their respective controllers (sort columns, filter columns, FK joins).
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- transactions ---
        // Queries: orderBy(transaction_date DESC), where(type), where(category), whereDate(transaction_date)
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['transaction_date', 'type'], 'txn_date_type_idx');
            $table->index('type', 'txn_type_idx');
            $table->index('user_id', 'txn_user_id_idx');
        });

        // --- activities ---
        // Queries: orderBy(logged_at DESC), where(type), where(user_id), whereDate(logged_at)
        Schema::table('activities', function (Blueprint $table) {
            $table->index('logged_at', 'act_logged_at_idx');
            $table->index('type', 'act_type_idx');
            $table->index('user_id', 'act_user_id_idx');
        });

        // --- salary_advances ---
        // Queries: orderBy(date DESC), where(created_by)
        Schema::table('salary_advances', function (Blueprint $table) {
            $table->index('date', 'sa_date_idx');
            $table->index('created_by', 'sa_created_by_idx');
        });

        // --- cargo_logs ---
        // Queries: orderBy(date DESC), where(payment_status), where(cargo_name)
        Schema::table('cargo_logs', function (Blueprint $table) {
            $table->index('date', 'cargo_date_idx');
            $table->index('payment_status', 'cargo_status_idx');
            $table->index('created_by', 'cargo_created_by_idx');
        });

        // --- vendor_statements ---
        // Queries: orderBy(created_at DESC), where(statement_received), where(status)
        Schema::table('vendor_statements', function (Blueprint $table) {
            $table->index('statement_received', 'vs_received_idx');
            $table->index('created_by', 'vs_created_by_idx');
        });

        // --- cheque_register ---
        // Queries: orderBy(issue_date DESC), where(status), where(cheque_date)
        Schema::table('cheque_register', function (Blueprint $table) {
            $table->index('issue_date', 'chq_issue_date_idx');
            $table->index('status', 'chq_status_idx');
            $table->index('cheque_date', 'chq_cheque_date_idx');
            $table->index('created_by', 'chq_created_by_idx');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('txn_date_type_idx');
            $table->dropIndex('txn_type_idx');
            $table->dropIndex('txn_user_id_idx');
        });
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex('act_logged_at_idx');
            $table->dropIndex('act_type_idx');
            $table->dropIndex('act_user_id_idx');
        });
        Schema::table('salary_advances', function (Blueprint $table) {
            $table->dropIndex('sa_date_idx');
            $table->dropIndex('sa_created_by_idx');
        });
        Schema::table('cargo_logs', function (Blueprint $table) {
            $table->dropIndex('cargo_date_idx');
            $table->dropIndex('cargo_status_idx');
            $table->dropIndex('cargo_created_by_idx');
        });
        Schema::table('vendor_statements', function (Blueprint $table) {
            $table->dropIndex('vs_received_idx');
            $table->dropIndex('vs_created_by_idx');
        });
        Schema::table('cheque_register', function (Blueprint $table) {
            $table->dropIndex('chq_issue_date_idx');
            $table->dropIndex('chq_status_idx');
            $table->dropIndex('chq_cheque_date_idx');
            $table->dropIndex('chq_created_by_idx');
        });
    }
};
