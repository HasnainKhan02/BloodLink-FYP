<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DonorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{



    /**
     * Fetch Nearby Available Donors within Radius (Haversine Formula)
     */
    public function getNearbyDonors(Request $request)
    {
        $request->validate([
            'lat'    => 'required|numeric',
            'lng'    => 'required|numeric',
            'radius' => 'nullable|numeric', // in km
        ]);

        $latitude = $request->lat;
        $longitude = $request->lng;
        $radius = $request->radius ?? 10;

        // Haversine query to fetch donors within radius
        $donors = User::select('users.*')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->where('role', 'donor')
            ->having('distance', '<=', $radius)
            ->orderBy('distance', 'asc')
            ->get();

        return response()->json($donors);
    }
    /**
     * Send OTP via Free Email SMTP
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $otp = rand(100000, 999999);
        $email = $request->email;

        // Cache OTP for 10 minutes
        cache()->put('otp_' . $email, $otp, now()->addMinutes(10));

        // Send Email via Laravel Mail
        try {
            Mail::raw("Your BloodLink Email Verification Code is: {$otp}\n\nThis code will expire in 10 minutes.", function ($message) use ($email) {
                $message->to($email)
                    ->subject('BloodLink - Email Verification Code');
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'OTP verification code sent to your email successfully!',
                'debug_otp' => config('app.debug') ? $otp : null
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to send email OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Email OTP & Register New User
     */
    public function verifyOtpAndRegister(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'phone'      => 'required|string|max:20',
            'otp'        => 'required|numeric|digits:6',
            'password'   => 'required|string|min:8',
            'blood_type' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        $cachedOtp = cache()->get('otp_' . $validated['email']);

        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or expired OTP code.'
            ], 400);
        }

        // Create Verified User
        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'phone'             => $validated['phone'],
            'email_verified_at' => now(),
            'password'          => Hash::make($validated['password']),
            'blood_type'        => $validated['blood_type'],
            'role'              => 'donor',
        ]);

        if (class_exists(DonorProfile::class)) {
            DonorProfile::create(['user_id' => $user->id]);
        }

        // Clear OTP from Cache
        cache()->forget('otp_' . $validated['email']);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Email verified and registration successful!',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    /**
     * Legacy Register Route (Fallback)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'phone'      => 'required|string|max:20',
            'password'   => 'required|string|min:8',
            'blood_type' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        $user = User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'],
            'password'   => Hash::make($validated['password']),
            'blood_type' => $validated['blood_type'],
            'role'       => 'donor',
        ]);

        if (class_exists(DonorProfile::class)) {
            DonorProfile::create(['user_id' => $user->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // Update profile Method

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'phone'      => 'sometimes|required|string|max:20',
            'blood_type' => 'sometimes|required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user'    => $user
        ]);
    }
    /**
     * Authenticate User Login
     */
    /**
     * Authenticate User Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email address or password credentials.'],
            ]);
        }

        // Generate Sanctum plain text token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Sign in successful',
            'token'   => $token,
            'user'    => $user,
        ], 200);
    }

    /**
     * Logout Current Session Token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }




    /**
     * Send Password Reset OTP via Email
     */
    public function sendResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No account found with this email address.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $otp = rand(100000, 999999);
        $email = $request->email;

        // Cache Reset OTP for 10 minutes
        cache()->put('reset_otp_' . $email, $otp, now()->addMinutes(10));

        try {
            Mail::raw("Your BloodLink Password Reset Code is: {$otp}\n\nIf you did not request a password reset, please ignore this email. Code expires in 10 minutes.", function ($message) use ($email) {
                $message->to($email)
                    ->subject('BloodLink - Password Reset Code');
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Password reset code sent to your email successfully!',
                'debug_otp' => config('app.debug') ? $otp : null
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to send reset code: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP & Reset User Password
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email|exists:users,email',
            'otp'      => 'required|numeric|digits:6',
            'password' => 'required|string|min:8|confirmed', // expects 'password_confirmation'
        ]);

        $cachedOtp = cache()->get('reset_otp_' . $validated['email']);

        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid or expired OTP reset code.'
            ], 400);
        }

        // Update User Password
        $user = User::where('email', $validated['email'])->first();
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Clear Reset OTP from Cache
        cache()->forget('reset_otp_' . $validated['email']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Password reset successfully! You can now sign in with your new password.'
        ], 200);
    }
}
