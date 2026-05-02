<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdherencePredictionService
{
    /**
     * @return array{is_adherent: int|null, adherence_score: float|null}
     */
    public function getPrediction(int $timeDifferenceMinutes): array
    {
        try {
            $response = Http::timeout(5)
                ->acceptJson()
                ->post('http://127.0.0.1:8001/predict', [
                    'time_difference_minutes' => (int) $timeDifferenceMinutes,
                ]);

            if (! $response->successful()) {
                Log::error('Adherence prediction API returned non-success response.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'is_adherent' => null,
                    'adherence_score' => null,
                ];
            }

            $json = $response->json();

            return [
                'is_adherent' => isset($json['is_adherent']) ? (int) $json['is_adherent'] : null,
                'adherence_score' => isset($json['adherence_score']) ? (float) $json['adherence_score'] : null,
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Prediction Failed: ' . $e->getMessage() . ' | Response: ' . (isset($response) ? $response->body() : 'No response'));
            return [
                'is_adherent' => null,
                'adherence_score' => null,
            ];
        }
    }
}
