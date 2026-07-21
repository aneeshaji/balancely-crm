<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('user:id,name,role');

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

        $query->orderBy('logged_at', 'desc');

        // If caller only wants the latest N records (e.g., dashboard recent feed), honour limit.
        // Otherwise paginate at 50 per page so we never dump the full table over the wire.
        if ($request->filled('limit')) {
            $limit = min((int) $request->limit, 100);
            return response()->json($query->limit($limit)->get());
        }

        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:supplier_followup,customer_inquiry,reconciliation,expense_payment,cash_reconciliation,internal_note'],
            'details' => ['required', 'string'],
            'reference_number' => ['nullable', 'string', 'max:255'],
        ]);

        $activity = Auth::user()->activities()->create([
            'type'             => $validated['type'],
            'details'          => $validated['details'],
            'reference_number' => $validated['reference_number'] ?? null,
            'logged_at'        => now(),
        ]);

        return response()->json([
            'message'  => 'Activity logged successfully',
            'activity' => $activity->load('user:id,name,role'),
        ], 201);
    }
}
