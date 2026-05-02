<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedicationRequest;
use App\Http\Requests\UpdateMedicationRequest;
use App\Models\Medication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $medications = $request->user()
            ->medications()
            ->latest()
            ->get();

        return response()->json([
            'data' => $medications,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicationRequest $request): JsonResponse
    {
        $medication = $request->user()
            ->medications()
            ->create($request->validated());

        return response()->json([
            'message' => 'Medication created successfully.',
            'data' => $medication,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $medication): JsonResponse
    {
        $userMedication = $this->findMedicationForUser($request, $medication);

        return response()->json([
            'data' => $userMedication,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicationRequest $request, int $medication): JsonResponse
    {
        $userMedication = Medication::query()->findOrFail($medication);

        if ($userMedication->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $userMedication->update($request->validated());

        return response()->json([
            'message' => 'Medication updated successfully.',
            'data' => $userMedication->fresh(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $medication): JsonResponse
    {
        $userMedication = Medication::query()->findOrFail($medication);

        if ($userMedication->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $userMedication->schedules()->delete();
        $userMedication->delete();

        return response()->json([
            'message' => 'Medication deleted successfully.',
        ]);
    }

    private function findMedicationForUser(Request $request, int $medicationId): Medication
    {
        return $request->user()
            ->medications()
            ->whereKey($medicationId)
            ->firstOrFail();
    }
}
