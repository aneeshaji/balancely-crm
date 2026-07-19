<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargo_logs', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('cargo_name');         // Transport company
            $table->string('party_name')->nullable();  // Handler/recipient
            $table->string('part_count')->nullable();  // e.g., "4 roll, 1 box"
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('phone_no')->nullable();
            $table->string('bill_no')->nullable();
            $table->text('notes')->nullable();
            $table->string('payment_status')->default('pending'); // pending, paid
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo_logs');
    }
};
