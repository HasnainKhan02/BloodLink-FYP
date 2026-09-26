<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Donation;
use App\Models\DonorProfile;

class DonationController extends Controller
{
    /**
     * Donor pledges to donate
     */
    public function pledgeDonation(Request $request, $id)
    {
        $user = $request->user();

        // Check if pledge already exists
        $donation = Donation::where('user_id', $user->id)
            ->where('blood_request_id', $id)
            ->first();

        if (!$donation) {
            $donation = Donation::create([
                'user_id' => $user->id,
                'blood_request_id' => $id,
                'proof_image' => 'pending',
                'status' => 'pending'
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pledged successfully. Please upload your donation proof slip.',
            'donation_id' => $donation->id
        ], 200);
    }

    /**
     * Upload proof document
     */
    public function uploadProof(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'donation_id' => 'required',
            'proof_image' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $donation = Donation::find($request->donation_id);

        if (!$donation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Donation record not found.'
            ], 404);
        }

        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('donation_proofs', 'public');
            $donation->proof_image = $path;
            $donation->status = 'pending'; // Ensure status is explicitly pending for admin review
            $donation->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Donation proof uploaded successfully! Pending Admin verification.',
            'donation' => $donation
        ], 200);
    }
}
