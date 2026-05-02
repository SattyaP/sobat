<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdherenceLog;
use App\Models\Schedule;
use App\Services\AdherencePredictionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AdherenceLogController extends Controller
{
    public function __construct(
        private readonly AdherencePredictionService $predictionService
    ) {
    }

    public function confirmConsumption(Request $request, Schedule $schedule): JsonResponse
    {
        try {
            $schedule->load('medication');

            if ($schedule->medication->user_id !== $request->user()->id) {
                abort(404);
            }

            $today = today();
            $now = now();

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
            $timeDifferenceMinutes = $scheduledDateTime->diffInMinutes($now, true);

            $adherenceLog->update([
                'confirmed_at' => $now,
                'status' => 'taken',
                'time_difference_minutes' => $timeDifferenceMinutes,
            ]);

            $prediction = $this->predictionService->getPrediction($timeDifferenceMinutes);

            return response()->json([
                'message' => 'Medication consumption confirmed.',
                'data' => $adherenceLog->fresh(),
                'prediction' => $prediction['is_adherent'],
                'adherence_score' => $prediction['adherence_score'],
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Failed to confirm medication consumption.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
}
