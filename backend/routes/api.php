<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

Route::get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/health', [HealthController::class, 'index']);