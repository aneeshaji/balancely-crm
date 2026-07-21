<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();
            $user->update([
                'last_login_at' => now(),
            ]);

            \App\Models\AuditLog::record('auth.login', "User {$user->name} logged in successfully.", null, $user->id);

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
            ]);
        }

        \App\Models\AuditLog::record('auth.login_failed', "Failed login attempt for email: " . $credentials['email'], ['email' => $credentials['email']]);

        throw ValidationException::withMessages([
            'email' => ['The provided credentials do not match our records.'],
        ]);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            \App\Models\AuditLog::record('auth.logout', "User {$user->name} logged out.", null, $user->id);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }
}
