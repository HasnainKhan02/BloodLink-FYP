<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\DonorProfile;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Helpers\BloodTypeHelper;

class BloodRequestController extends Controller
{
    /**
     * Fetch nearby emergency requests for donor dashboard.
     * Automatically filters out donors who are currently in 90-day cooldown.
     */
    /**
     * Fetch nearby emergency requests for donor dashboard.
     * Includes both pending requests and accepted requests where the current user is responder or requester.
     */
public function nearby(Request $request)
{
    $user = $request->user();

    // 1. Check 90-Day Medical Cooldown Status
    $donorProfile = DonorProfile::where('user_id', $user->id)->first();
    $lastDonationDate = $donorProfile->last_donation_date ?? $user->last_donation_date ?? null;

    $inCooldown = false;
    $daysRemaining = 0;

    if ($lastDonationDate) {
        $lastDonation = Carbon::parse($lastDonationDate);
        $daysPassed = (int) $lastDonation->diffInDays(now());

        if ($daysPassed < 90) {
            $inCooldown = true;
            $daysRemaining = 90 - $daysPassed;
        }
    }

    // 2. Query requests
    $query = BloodRequest::with([
        'requester:id,name,phone,email',
        'responder:id,name,phone,email,latitude,longitude',
        'donations' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }
    ]);

    if ($inCooldown) {
        // Cooldown ma sirf apni created requests dikhao
        $query->where('requester_id', $user->id);
    } else {
        $query->where(function ($q) use ($user) {
            $q->where('status', 'pending')
                ->orWhere(function ($inner) use ($user) {
                    $inner->where('status', 'accepted')
                        ->where(function ($sub) use ($user) {
                            $sub->where('responder_id', $user->id)
                                ->orWhere('requester_id', $user->id);
                        });
                });
        });
    }

    $requests = $query->orderBy('created_at', 'desc')->get();

// 3. Distance & donation flag calc (Fixed for Declined Status)
    $filteredRequests = $requests->map(function ($req) use ($user) {
        // Filter out 'declined' donations so rejected proof doesn't block re-uploading
        $userDonation = $req->donations->where('status', '!=', 'declined')->first();

        $req->user_donation_status = $userDonation ? $userDonation->status : null;

        // Ensure user_has_proof is only true if donation exists and is NOT declined
        $req->user_has_proof = $userDonation
            && $userDonation->proof_image
            && $userDonation->proof_image !== 'pending'
            && $userDonation->status !== 'declined';

        if ($user->latitude && $user->longitude && $req->latitude && $req->longitude) {
            $earthRadius = 6371;
            $latFrom = deg2rad($user->latitude);
            $lonFrom = deg2rad($user->longitude);
            $latTo   = deg2rad($req->latitude);
            $lonTo   = deg2rad($req->longitude);

            $latDelta = $latTo - $latFrom;
            $lonDelta = $lonTo - $lonFrom;

            $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
                cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

            $req->distance_km = round($angle * $earthRadius, 1);
        } else {
            $req->distance_km = null;
        }

        return $req;
    });

    // Wrapped response with cooldown info
    return response()->json([
        'in_cooldown'    => $inCooldown,
        'days_remaining' => $daysRemaining,
        'data'           => $filteredRequests
    ], 200);
}

    /**
     * Create a new emergency blood request and notify same blood-type donors.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_name'   => 'required|string|max:255',
            'age'            => 'required|numeric|min:1',
            'blood_type'     => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'units_needed'   => 'required|numeric|min:1',
            'urgency'        => 'required|string',
            'hospital_name'  => 'required|string|max:255',
            'city'           => 'required|string|max:255',
            'address'        => 'required|string',
            'latitude'       => 'required|numeric',
            'longitude'      => 'required|numeric',
            'phone'          => 'nullable|string|max:20',
            'proof_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // 1. Handle Medical Proof File Upload
        $proofPath = null;
        if ($request->hasFile('proof_document')) {
            $proofPath = $request->file('proof_document')->store('proofs', 'public');
        }

        // 2. Create Blood Request
        $bloodRequest = BloodRequest::create([
            'requester_id'   => $user->id,
            'patient_name'   => $request->patient_name,
            'age'            => $request->age,
            'blood_type'     => strtoupper($request->blood_type),
            'units_needed'   => $request->units_needed,
            'urgency'        => strtoupper($request->urgency),
            'hospital_name'  => $request->hospital_name,
            'city'           => $request->city,
            'address'        => $request->address,
            'latitude'       => $request->latitude,
            'longitude'      => $request->longitude,
            'contact_phone'  => $request->phone ?? $user->phone ?? '0000000000',
            'proof_document' => $proofPath,
            'status'         => 'pending',
        ]);

        // 3. Get Medically Compatible Donor Blood Types
        $compatibleBloodTypes = BloodTypeHelper::getCompatibleDonorTypes($request->blood_type);

        // 4. Query Compatible Donors (Excludes requester & donors currently in 90-day cooldown)
        $eligibleDonors = User::whereIn('blood_type', $compatibleBloodTypes)
            ->where('id', '!=', $user->id)
            ->where(function ($query) {
                $query->whereNull('last_donation_date')
                    ->orWhere('last_donation_date', '<=', Carbon::now()->subDays(90));
            })
            ->get();

        // 5. Route Push/In-App Notifications strictly to eligible donors
        foreach ($eligibleDonors as $donor) {
            Notification::create([
                'user_id'          => $donor->id,
                'blood_request_id' => $bloodRequest->id,
                'title'            => "Urgent: {$request->blood_type} Blood Required!",
                'message'          => "Emergency request for {$request->patient_name} at {$request->hospital_name}, {$request->city}.",
                'is_read'          => false,
            ]);
        }

        return response()->json([
            'status'             => 'success',
            'message'            => 'Request created successfully and routed to compatible donors.',
            'notified_donors'    => $eligibleDonors->count(),
            'compatible_groups'  => $compatibleBloodTypes,
            'data'               => $bloodRequest
        ], 201);
    }

    /**
     * Accept an emergency blood request.
     */
    public function acceptRequest(Request $request, $id)
    {
        $user = $request->user();

        // Block accepting if donor is in 90-day cooldown
        $donorProfile = DonorProfile::where('user_id', $user->id)->first();
        $lastDonationDate = $donorProfile->last_donation_date ?? $user->last_donation_date ?? null;

        if ($lastDonationDate) {
            $lastDonation = Carbon::parse($lastDonationDate);
            $daysPassed = (int) $lastDonation->diffInDays(now());

            if ($daysPassed < 90) {
                $daysRemaining = 90 - $daysPassed;
                return response()->json([
                    'status'  => 'error',
                    'message' => "You are in a 90-day recovery cooldown ($daysRemaining days remaining). You cannot donate blood right now."
                ], 403);
            }
        }

        $bloodRequest = BloodRequest::find($id);

        if (!$bloodRequest) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Blood request not found.'
            ], 404);
        }

        if ($bloodRequest->requester_id == $user->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You cannot accept your own request.'
            ], 400);
        }

        // Update request status and assign donor ID
        $bloodRequest->status = 'accepted';
        $bloodRequest->responder_id = $user->id;
        $bloodRequest->save();

        // Notify the requester about the matched donor
        Notification::create([
            'user_id'          => $bloodRequest->requester_id,
            'blood_request_id' => $bloodRequest->id,
            'title'            => 'Donor Matched!',
            'message'          => "{$user->name} has accepted your emergency request for {$bloodRequest->blood_type} blood.",
            'is_read'          => false,

        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Request accepted successfully!',
            'data'    => $bloodRequest->load('responder:id,name,phone,email')
        ], 200);
    }

    /**
     * Fetch all requests posted by the currently authenticated user.
     */
    public function userRequests(Request $request)
    {
        $requests = $request->user()
            ->bloodRequests()
            ->with('responder:id,name,phone,email,latitude,longitude')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $requests
        ], 200);
    }
}
