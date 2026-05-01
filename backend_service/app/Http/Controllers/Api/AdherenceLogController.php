<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdherenceLog;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdherenceLogController extends Controller
{
    public function confirmConsumption(Request $request, Schedule $schedule): JsonResponse
    {
        $schedule->load('medication');

        if ($schedule->medication->user_id !== $request->user()->id) {
            abort(404);
        }

        $today = today();
        $confirmedAt = now();

        $adherenceLog = AdherenceLog::query()->firstOrCreate(
            [
                'schedule_id' => $schedule->id,
                'scheduled_date' => $today->toDateString(),
            ],
            [
                'status' => 'pending',
            ]
        );

        $scheduledDateTime = Carbon::parse(
            sprintf('%s %s', $today->toDateString(), $schedule->scheduled_time)
        );

        $adherenceLog->update([
            'confirmed_at' => $confirmedAt,
            'status' => 'taken',
            'time_difference_minutes' => $scheduledDateTime->diffInMinutes($confirmedAt, false),
        ]);

        return response()->json([
            'message' => 'Medication consumption confirmed.',
            'data' => $adherenceLog->fresh(),
        ]);
    }
}
