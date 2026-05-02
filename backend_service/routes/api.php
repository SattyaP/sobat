<?php

use App\Http\Controllers\Api\AdherenceLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MedicationController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\StatisticController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('medications', MedicationController::class);
    Route::get('/statistics', [StatisticController::class, 'index']);
    Route::get('/schedules/today', [ScheduleController::class, 'today']);
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('/schedules/{schedule}/confirm', [AdherenceLogController::class, 'confirmConsumption']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
