<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\BloodRequest;
use App\Models\User;
use App\Helpers\NotificationHelper;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * 1. Get All Emergency Requests for Dashboard
     */
    public function allRequests()
    {
        $requests = BloodRequest::with(['requester:id,name,phone,email', 'responder:id,name,phone,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $requests
        ], 200);
    }

    /**
     * 2. Get All Registered Users
     */
    public function allUsers()
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $users
        ], 200);
    }

    /**
     * 3. Get Pending Donation Proofs for Verification Tab
     */
    public function getPendingDonations()
    {
        $pending = Donation::with([
            'user:id,name,email,phone,blood_type',
            'bloodRequest:id,patient_name,hospital_name,city'
        ])
        ->where('status', 'pending')
        ->whereNotNull('proof_image')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $pending
        ], 200);
    }

    /**
     * 4. Get Users Currently in 90-Day Medical Cooldown
     */
    public function getCooldownUsers()
    {
        $cooldownThreshold = Carbon::now()->subDays(90);

        $users = User::where(function ($query) use ($cooldownThreshold) {
            $query->whereNotNull('last_donation_date')
                  ->where('last_donation_date', '>=', $cooldownThreshold);
        })
        ->orWhereHas('donorProfile', function ($q) use ($cooldownThreshold) {
            $q->whereNotNull('last_donation_date')
              ->where('last_donation_date', '>=', $cooldownThreshold);
        })
        ->with('donorProfile')
        ->get()
        ->map(function ($user) {
            $rawDate = $user->last_donation_date ?? $user->donorProfile->last_donation_date ?? null;
            $startDate = Carbon::parse($rawDate);

            $daysCompleted = (int) $startDate->diffInDays(now());
            $daysRemaining = max(0, 90 - $daysCompleted);
            $progressPercentage = min(100, max(0, round(($daysCompleted / 90) * 100)));

            return [
                'id'                  => $user->id,
                'name'                => $user->name,
                'email'               => $user->email,
                'phone'               => $user->phone ?? 'N/A',
                'blood_type'          => $user->blood_type ?? $user->donorProfile->blood_type ?? 'N/A',
                'cooldown_start_date' => $startDate->format('Y-m-d'),
                'days_completed'     => $daysCompleted,
                'days_remaining'     => $daysRemaining,
                'progress_percentage' => $progressPercentage,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $users
        ], 200);
    }

    /**
     * 5. Verify Donation Proof & Activate Cooldown
     */
    public function verifyDonation(Request $request, $id)
    {
        $donation = Donation::findOrFail($id);
        $donation->status = 'verified';
        $donation->verified_at = now();
        $donation->save();

        // Activate donor 90-day cooldown
        $user = $donation->user;
        if ($user) {
            $user->last_donation_date = now();
            $user->save();
        }

        // Update blood request status
        if ($donation->bloodRequest) {
            $donation->bloodRequest->status = 'fulfilled';
            $donation->bloodRequest->save();
        }

        // Send Notification
        NotificationHelper::create(
            $donation->user_id,
            'Donation Proof Verified!',
            'Your hospital donation proof has been approved by Admin. Your 90-day cooldown is now active.',
            'proof_verified',
            $donation->blood_request_id
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Donation verified successfully and saved to history.',
        ], 200);
    }

    /**
     * 6. Decline Donation Proof (Saves to History, NO Delete)
     */
    public function declineDonation(Request $request, $id)
    {
        $donation = Donation::findOrFail($id);
        $donation->status = 'declined';
        $donation->declined_at = now();
        $donation->admin_notes = $request->input('reason', 'Proof document invalid or unreadable');
        $donation->save();

        // Reset Blood Request back to pending so other donors can respond
        if ($donation->bloodRequest) {
            $donation->bloodRequest->status = 'pending';
            $donation->bloodRequest->responder_id = null;
            $donation->bloodRequest->save();
        }

        // Send Notification
        NotificationHelper::create(
            $donation->user_id,
            'Donation Proof Declined',
            'Your hospital donation proof was declined by Admin. Please re-check and upload valid proof.',
            'proof_declined',
            $donation->blood_request_id
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Donation proof declined and recorded in history.',
        ], 200);
    }

    /**
     * 7. Export Verified & Declined History to CSV File
     */
    public function exportDonationHistory(Request $request)
    {
        $donations = Donation::with([
            'user:id,name,email,phone,blood_type',
            'bloodRequest.requester:id,name,email,phone',
            'bloodRequest'
        ])
        ->whereIn('status', ['verified', 'declined'])
        ->orderBy('updated_at', 'desc')
        ->get();

        $fileName = 'bloodlink_donation_history_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Donation ID',
            'Status',
            'Donor Name',
            'Donor Email',
            'Donor Phone',
            'Donor Blood Group',
            'Requester Name',
            'Patient Name',
            'Hospital Name',
            'City',
            'Date Processed'
        ];

        $callback = function() use($donations, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($donations as $row) {
                fputcsv($file, [
                    $row->id,
                    strtoupper($row->status),
                    $row->user->name ?? 'N/A',
                    $row->user->email ?? 'N/A',
                    $row->user->phone ?? 'N/A',
                    $row->user->blood_type ?? 'N/A',
                    $row->bloodRequest->requester->name ?? 'N/A',
                    $row->bloodRequest->patient_name ?? 'N/A',
                    $row->bloodRequest->hospital_name ?? 'N/A',
                    $row->bloodRequest->city ?? 'N/A',
                    $row->updated_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * 8. Delete Request
     */
    public function deleteRequest($id)
    {
        $request = BloodRequest::findOrFail($id);
        $request->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Emergency request deleted successfully.'
        ], 200);
    }
}
