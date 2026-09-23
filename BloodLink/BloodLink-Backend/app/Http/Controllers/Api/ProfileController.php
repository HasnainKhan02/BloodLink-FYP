<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile and medical info.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load(['donorProfile', 'verificationDocuments']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'blood_type' => $user->blood_type,
            'is_verified' => $user->is_verified,
            'profile' => $user->donorProfile,
            'documents' => $user->verificationDocuments,
        ]);
    }

    /**
     * Update donor profile and medical physical metrics.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validatedUser = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'blood_type' => 'sometimes|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        $validatedProfile = $request->validate([
            'address' => 'nullable|string',
            'weight_kg' => 'nullable|integer|min:30|max:200',
            'blood_pressure' => 'nullable|string',
            'last_donation_date' => 'nullable|date',
        ]);

        $user->update($validatedUser);

        if ($user->donorProfile) {
            $user->donorProfile->update($validatedProfile);
        } else {
            $user->donorProfile()->create($validatedProfile);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(['donorProfile']),
        ]);
    }

    /**
     * Upload medical verification report / ID document.
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'document_type' => 'nullable|string',
        ]);

        $user = $request->user();

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('verification_docs', 'public');

            $doc = $user->verificationDocuments()->create([
                'document_name' => $request->file('document')->getClientOriginalName(),
                'file_path' => $path,
                'document_type' => $request->input('document_type', 'Medical Verification'),
                'status' => 'PENDING',
            ]);

            return response()->json([
                'message' => 'Document uploaded successfully and pending admin verification.',
                'document' => $doc,
            ], 201);
        }

        return response()->json(['message' => 'No document file uploaded.'], 400);
    }
}