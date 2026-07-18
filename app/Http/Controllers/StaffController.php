<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
 
        return response()->json([
            'message' => 'Staff member registered successfully',
            'staff' => $user->load('designation'),
        ], 201);
    }
}
