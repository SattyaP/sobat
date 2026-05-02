<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Models\Medication;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $schedules = Schedule::query()
            ->whereHas('medication', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->with('medication:id,user_id,name,dosage,frequency')
            ->latest()
            ->get();

        return response()->json([
            'data' => $schedules,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $medication = Medication::query()
            ->whereKey($validated['medication_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $startTime = Carbon::createFromFormat('H:i', $validated['scheduled_time']);

        $hourOffsets = match ((int) $medication->frequency) {
            1 => [0],
            2 => [0, 12],
            3 => [0, 7, 14],
            4 => [0, 5, 9, 14],
            default => [0],
        };

        DB::beginTransaction();

        try {
            $createdSchedules = [];

            foreach ($hourOffsets as $offset) {
                $createdSchedules[] = Schedule::query()->create([
                    'medication_id' => $medication->id,
                    'scheduled_time' => $startTime->copy()->addHours($offset)->format('H:i'),
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Schedule created successfully.',
                'data' => $createdSchedules,
            ], 201);
        } catch (Throwable $exception) {
            DB::rollBack();

            Log::error('Gagal membuat jadwal otomatis.', [
                'user_id' => $request->user()?->id,
                'medication_id' => $validated['medication_id'] ?? null,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal membuat jadwal otomatis.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $schedule): JsonResponse
    {
        $userSchedule = $this->findScheduleForUser($request, $schedule);

        return response()->json([
            'data' => $userSchedule,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, int $schedule): JsonResponse
    {
        $userSchedule = Schedule::query()->with('medication:id,user_id')->findOrFail($schedule);

        if ($userSchedule->medication?->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $userSchedule->update($request->validated());

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'data' => $userSchedule->fresh(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $schedule): JsonResponse
    {
        $userSchedule = Schedule::query()->with('medication:id,user_id')->findOrFail($schedule);

        if ($userSchedule->medication?->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $userSchedule->delete();

        return response()->json([
            'message' => 'Schedule deleted successfully.',
        ]);
    }

    public function today(Request $request): JsonResponse
    {
        try {
            $today = Carbon::today()->toDateString();

            $schedules = Schedule::query()
                ->whereHas('medication', function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);
                })
                ->with('medication:id,user_id,name,dosage,frequency')
                ->with(['adherenceLogs' => function ($query) use ($today) {
                    $query->whereDate('scheduled_date', $today);
                }])
                ->orderBy('scheduled_time')
                ->get();

            return response()->json([
                'data' => $schedules,
            ]);
        } catch (Throwable $exception) {
            Log::error('Gagal memuat jadwal hari ini.', [
                'user_id' => $request->user()?->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memuat jadwal hari ini.',
            ], 500);
        }
    }

    private function findScheduleForUser(Request $request, int $scheduleId): Schedule
    {
        return Schedule::query()
            ->whereHas('medication', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->whereKey($scheduleId)
            ->firstOrFail();
    }
}
