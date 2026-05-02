<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdherenceLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class StatisticController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->id;

            $totalLogs = AdherenceLog::query()
                ->whereHas('schedule.medication', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->count();

            $hasPredictionColumn = Schema::hasColumn('adherence_logs', 'prediction');

            $adherentLogsQuery = AdherenceLog::query()
                ->whereHas('schedule.medication', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                });

            if ($hasPredictionColumn) {
                $adherentLogsQuery->where('prediction', 1);
            } else {
                $adherentLogsQuery->where('status', 'taken');
            }

            $adherentLogs = $adherentLogsQuery->count();

            $overallPercentage = $totalLogs > 0
                ? round(($adherentLogs / $totalLogs) * 100)
                : 0;

            $weekStart = Carbon::today()->subDays(6);
            $weeklyTrend = [];

            for ($offset = 0; $offset < 7; $offset++) {
                $date = $weekStart->copy()->addDays($offset);

                $dailyQuery = AdherenceLog::query()
                    ->whereDate('scheduled_date', $date->toDateString())
                    ->whereHas('schedule.medication', function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    });

                $dailyTotal = (clone $dailyQuery)->count();
                $dailyAdherentQuery = clone $dailyQuery;

                if ($hasPredictionColumn) {
                    $dailyAdherentQuery->where('prediction', 1);
                } else {
                    $dailyAdherentQuery->where('status', 'taken');
                }

                $dailyTaken = $dailyAdherentQuery->count();
                $dailyPercentage = $dailyTotal > 0
                    ? round(($dailyTaken / $dailyTotal) * 100, 2)
                    : 0.0;

                $weeklyTrend[] = [
                    'date' => $date->toDateString(),
                    'day' => $date->isoFormat('dd'),
                    'percentage' => $dailyPercentage,
                ];
            }

            return response()->json([
                'overall_percentage' => $overallPercentage,
                'weekly_trend' => $weeklyTrend,
            ]);
        } catch (Throwable $exception) {
            Log::error('Gagal memuat statistik kepatuhan.', [
                'user_id' => $request->user()?->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memuat statistik kepatuhan.',
            ], 500);
        }
    }
}
