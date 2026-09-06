<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('invoice_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('type');

            $table->string('severity')
                ->default('medium');

            $table->string('title');

            $table->text('message');

            $table->string('status')
                ->default('unread');

            $table->timestamp('notified_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};