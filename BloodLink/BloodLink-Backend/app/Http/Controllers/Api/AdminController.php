<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get summary metrics for the Admin Dashboard.
     */
    public function analytics()
    {
        $totalDonors = User::where('role', 'donor')->count();
        $activeRequests = BloodRequest::where('status', 'APPROVED')->count();
        $fulfilledMatches = BloodRequest::where('status', 'FULFILLED')->count();
        $pendingVerification = BloodRequest::where('status', 'PENDING')->count();

        return response()->json([
            'total_donors' => $totalDonors,
            'active_requests' => $activeRequests,
            'fulfilled_matches' => $fulfilledMatches,
            'pending_verification' => $pendingVerification,
        ]);
    }

    /**
     * Fetch pending emergency blood requests waiting for verification.
     */
    public function verificationQueue()
    {
        $pendingRequests = BloodRequest::with('requester')
            ->where('status', 'PENDING')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pendingRequests);
    }

    /**
     * Approve or Reject a blood request.
     */
    public function updateRequestStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:APPROVED,REJECTED,FULFILLED',
        ]);

        $bloodRequest = BloodRequest::findOrFail($id);
        $bloodRequest->status = $request->status;
        $bloodRequest->save();

        return response()->json([
            'message' => "Blood request status updated to {$request->status}.",
            'data' => $bloodRequest,
        ]);
    }

    /**
     * Ban or suspend a reported user.
     */
    public function banUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Example: toggle or update status column/flag
        $user->is_verified = false; 
        $user->save();

        return response()->json([
            'message' => "User {$user->name} has been moderated/banned.",
            'user' => $user,
        ]);
    }
}