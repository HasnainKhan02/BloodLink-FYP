<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BloodRequestController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DonationController;

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

// Auth & Password Reset Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register-verified', [AuthController::class, 'verifyOtpAndRegister']);
Route::post('/forgot-password', [AuthController::class, 'sendResetOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


/*
|--------------------------------------------------------------------------
| Protected User Routes (Requires Sanctum Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth Session
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/upload-doc', [ProfileController::class, 'uploadDocument']);
    Route::get('/donors/nearby', [AuthController::class, 'getNearbyDonors']);

    // Blood Emergency Requests
    Route::get('/requests/nearby', [BloodRequestController::class, 'nearby']);
    Route::post('/requests', [BloodRequestController::class, 'store']);
    Route::get('/requests/my', [BloodRequestController::class, 'userRequests']);
    Route::post('/requests/{id}/accept', [BloodRequestController::class, 'acceptRequest']);

    // Pledges & Proof Uploads
    Route::post('/requests/{id}/pledge', [DonationController::class, 'pledgeDonation']);
    Route::post('/donations/upload-proof', [DonationController::class, 'uploadProof']);

    // Notifications Module
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});


/*
|--------------------------------------------------------------------------
| Admin Routes (Strictly Admin Role Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard & Core Stats
    Route::get('/requests', [AdminController::class, 'allRequests']);
    Route::get('/users', [AdminController::class, 'allUsers']);
    Route::delete('/requests/{id}', [AdminController::class, 'deleteRequest']);
    Route::get('/analytics', [AdminController::class, 'analytics']);

    // Proof Verification Queue & Actions
    Route::get('/pending-donations', [AdminController::class, 'getPendingDonations']);
    Route::get('/verification-queue', [AdminController::class, 'verificationQueue']);
    Route::post('/donations/{id}/verify', [AdminController::class, 'verifyDonation']);
    Route::post('/donations/{id}/decline', [AdminController::class, 'declineDonation']);

    // Cooldown Donors & Export CSV History
    Route::get('/cooldown-users', [AdminController::class, 'getCooldownUsers']);
    Route::get('/donations/export-history', [AdminController::class, 'exportDonationHistory']);

    // Extra Management Controls
    Route::patch('/requests/{id}/status', [AdminController::class, 'updateRequestStatus']);
    Route::post('/users/{id}/ban', [AdminController::class, 'banUser']);
});
