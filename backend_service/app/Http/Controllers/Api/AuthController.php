<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create($request->validated());
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful.',
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (QueryException $exception) {
            return $this->errorResponse('Unable to register user right now.', 500, $exception->getMessage());
        } catch (Throwable $exception) {
            return $this->errorResponse('An unexpected error occurred during registration.', 500, $exception->getMessage());
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $user = User::where('email', $credentials['email'])->first();

            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful.',
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (QueryException $exception) {
            return $this->errorResponse('Unable to login right now.', 500, $exception->getMessage());
        } catch (Throwable $exception) {
            return $this->errorResponse('An unexpected error occurred during login.', 500, $exception->getMessage());
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Logout successful.',
            ]);
        } catch (Throwable $exception) {
            return $this->errorResponse('An unexpected error occurred during logout.', 500, $exception->getMessage());
        }
    }

    private function errorResponse(string $message, int $status, ?string $debug = null): JsonResponse
    {
        $payload = ['message' => $message];

        if (config('app.debug') && $debug !== null) {
            $payload['error'] = $debug;
        }

        return response()->json($payload, $status);
    }
}
