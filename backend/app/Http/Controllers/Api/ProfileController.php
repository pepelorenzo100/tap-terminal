<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = Profile::where(
            'user_id',
            $user->getKey()
        )->first();

        return response()->json([
            'message' => 'Perfil obtenido correctamente.',
            'data' => $profile,
        ], 200);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => [
                'nullable',
                'string',
                'regex:/^\+[1-9]\d{7,14}$/',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'nullable',
                'string',
                'max:100',
            ],

            'state' => [
                'nullable',
                'string',
                'max:100',
            ],

            'country' => [
                'nullable',
                'string',
                'max:100',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:20',
            ],

            'birth_date' => [
                'nullable',
                'date',
            ],

            'gender' => [
                'nullable',
                'string',
                'max:50',
            ],

            'bio' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $profile = Profile::updateOrCreate(
            [
                'user_id' => $user->getKey(),
            ],
            $validated
        );

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'data' => $profile,
        ], 200);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = Profile::where(
            'user_id',
            $user->getKey()
        )->first();

        if ($profile) {
            $profile->delete();
        }

        return response()->json([
            'message' => 'Perfil eliminado correctamente.',
        ], 200);
    }
}