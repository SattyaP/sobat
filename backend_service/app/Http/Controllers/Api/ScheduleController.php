<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $schedule = Schedule::create($request->validated());

        return response()->json([
            'message' => 'Schedule created successfully.',
            'data' => $schedule,
        ], 201);
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
        $userSchedule = $this->findScheduleForUser($request, $schedule);
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
        $userSchedule = $this->findScheduleForUser($request, $schedule);
        $userSchedule->delete();

        return response()->json([
            'message' => 'Schedule deleted successfully.',
        ]);
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
