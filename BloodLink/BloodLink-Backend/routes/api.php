<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BloodRequestController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Health Check / Connection Test Route
Route::get('/ping', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'BloodLink Laravel API is connected!',
        'timestamp' => now()->toIso8601String()
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/requests/nearby', [BloodRequestController::class, 'nearby']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Sanctum Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile & Medical
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/upload-doc', [ProfileController::class, 'uploadDocument']);

    // Blood Requests
    Route::post('/requests', [BloodRequestController::class, 'store']);
    Route::get('/requests/my', [BloodRequestController::class, 'userRequests']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Admin Panel Actions (Requires Admin Role)
    Route::middleware('can:admin-access')->prefix('admin')->group(function () {
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/verification-queue', [AdminController::class, 'verificationQueue']);
        Route::patch('/requests/{id}/status', [AdminController::class, 'updateRequestStatus']);
        Route::post('/users/{id}/ban', [AdminController::class, 'banUser']);
    });
});