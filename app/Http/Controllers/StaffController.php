<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeStaffMail;
use App\Mail\StaffResetPasswordMail;
use Illuminate\Support\Facades\Log;

class StaffController extends Controller
{
    public function index()
    {
        $staff = User::with('designation')
            ->withCount(['activities', 'transactions'])
            ->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->get();
 
        return response()->json($staff);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,staff'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
        ]);
 
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'designation_id' => $validated['designation_id'] ?? null,
        ]);
 
        // Send the welcome email
        try {
            Mail::to($user->email)->send(new WelcomeStaffMail($user, $validated['password']));
        } catch (\Exception $e) {
            Log::error('Welcome email failed to send to ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Staff member registered successfully',
            'staff' => $user->load('designation'),
        ], 201);
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        try {
            Mail::to($user->email)->send(new StaffResetPasswordMail($user, $validated['password']));
        } catch (\Exception $e) {
            Log::error('Password reset email failed to send to ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }
}
