<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
 
class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::user()->load('designation');
        return response()->json($user);
    }
 
    public function update(Request $request)
    {
        $user = Auth::user();
 
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);
 
        $user->update($validated);
 
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('designation'),
        ]);
    }
 
    public function changePassword(Request $request)
    {
        $user = Auth::user();
 
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::defaults()],
        ]);
 
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The provided password does not match your current password.',
                'errors' => [
                    'current_password' => ['The provided password does not match your current password.']
                ]
            ], 422);
        }
 
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
 
        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }
}
