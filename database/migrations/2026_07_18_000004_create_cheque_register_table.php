<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cheque_register', function (Blueprint $table) {
            $table->id();
            $table->date('issue_date')->nullable();       // Date cheque was handed/issued
            $table->string('cheque_no');                  // Cheque number (sequential)
            $table->string('vendor_name')->nullable();    // Payee / Supplier
            $table->date('cheque_date')->nullable();      // Date written on cheque
            $table->decimal('amount', 10, 2)->nullable();
            $table->enum('status', ['issued', 'cleared', 'bounced', 'cancelled'])->default('issued');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheque_register');
    }
};
