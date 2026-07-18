<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('user');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('details', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('logged_at', $request->date);
        }

        $activities = $query->orderBy('logged_at', 'desc')->get();

        return response()->json($activities);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:supplier_followup,customer_inquiry,reconciliation,expense_payment,cash_reconciliation,internal_note'],
            'details' => ['required', 'string'],
            'reference_number' => ['nullable', 'string', 'max:255'],
        ]);

        $activity = Auth::user()->activities()->create([
            'type' => $validated['type'],
            'details' => $validated['details'],
            'reference_number' => $validated['reference_number'] ?? null,
            'logged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Activity logged successfully',
            'activity' => $activity->load('user'),
        ], 201);
    }
}
