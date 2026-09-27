<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;

class PublicVerificationController extends Controller
{
    public function verifyDonor($hash)
    {
        $user = User::where('verification_hash', $hash)->firstOrFail();

        $lastDonation = $user->last_donation_date ? Carbon::parse($user->last_donation_date) : null;
        $inCooldown = false;
        $daysRemaining = 0;

        if ($lastDonation) {
            $daysPassed = (int) $lastDonation::now()->diffInDays($lastDonation);
            if ($daysPassed < 90) {
                $inCooldown = true;
                $daysRemaining = 90 - $daysPassed;
            }
        }

        // Calculate Badge Level
        $verifiedDonationsCount = $user->donations()->where('status', 'verified')->count();
        $badge = match (true) {
            $verifiedDonationsCount >= 10 => 'Gold Life Saver',
            $verifiedDonationsCount >= 5  => 'Silver Hero',
            $verifiedDonationsCount >= 1  => 'Bronze Donor',
            default                       => 'Verified Member',
        };

        return response()->json([
            'status' => 'success',
            'data'   => [
                'name'                  => $user->name,
                'blood_type'            => $user->blood_type ?? 'N/A',
                'badge'                 => $badge,
                'total_verified_donations' => $verifiedDonationsCount,
                'in_cooldown'           => $inCooldown,
                'cooldown_days_remaining' => $daysRemaining,
                'verified_status'       => 'Official BloodLink Registered Donor',
            ]
        ]);
    }
}
