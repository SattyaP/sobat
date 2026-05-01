<?php

use App\Models\Schedule;
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
        Schema::create('adherence_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Schedule::class)->constrained()->cascadeOnDelete();
            $table->date('scheduled_date');
            $table->timestamp('confirmed_at')->nullable();
            $table->enum('status', ['pending', 'taken', 'missed'])->default('pending');
            $table->integer('time_difference_minutes')->nullable();
            $table->timestamps();

            $table->unique(['schedule_id', 'scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adherence_logs');
    }
};
