<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BloodRequestController extends Controller
{
    /**
     * Search nearby emergency requests using the Haversine formula in SQL.
     */
    public function nearby(Request $request)
    {
        $lat = (float) $request->query('latitude', 0);
        $lng = (float) $request->query('longitude', 0);
        $bloodType = $request->query('blood_type');

        $query = BloodRequest::select('*', DB::raw("
            ( 6371 * acos( cos( radians($lat) ) * cos( radians( latitude ) )
            * cos( radians( longitude ) - radians($lng) ) + sin( radians($lat) )
            * sin( radians( latitude ) ) ) ) AS distance_km
        "))->where('status', 'APPROVED');

        if ($bloodType && $bloodType !== 'All') {
            $query->where('blood_type', $bloodType);
        }

        $requests = $query->orderBy('distance_km', 'asc')->get();

        return response()->json($requests);
    }

    /**
     * Create a new emergency blood request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'hospital_name' => 'required|string|max:255',
            'blood_type' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'units_required' => 'required|integer|min:1',
            'urgency' => 'required|in:NORMAL,URGENT,CRITICAL',
            'contact_phone' => 'required|string|max:20',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'required|string',
        ]);

        $bloodRequest = $request->user()->bloodRequests()->create($validated);

        return response()->json([
            'message' => 'Blood request created successfully and sent to admin for verification.',
            'data' => $bloodRequest
        ], 201);
    }

    /**
     * Fetch all requests posted by the currently authenticated user.
     */
    public function userRequests(Request $request)
    {
        $requests = $request->user()
            ->bloodRequests()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }
}
