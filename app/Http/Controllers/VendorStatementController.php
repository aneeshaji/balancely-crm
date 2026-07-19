<?php

namespace App\Http\Controllers;

use App\Models\VendorStatement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VendorStatementController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorStatement::with('creator');

        if ($request->filled('vendor_name')) {
            $query->where('vendor_name', 'like', '%' . $request->vendor_name . '%');
        }

        if ($request->filled('statement_received')) {
            $query->where('statement_received', $request->boolean('statement_received'));
        }

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $statements = $query->orderBy('vendor_name', 'asc')->get();

        return response()->json($statements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:255'],
            'statement_received' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = Auth::id();
        $validated['statement_received'] = $request->boolean('statement_received');

        $statement = VendorStatement::create($validated);

        return response()->json([
            'message' => 'Vendor statement tracked successfully',
            'vendor_statement' => $statement->load('creator')
        ], 201);
    }

    public function update(Request $request, VendorStatement $vendorStatement)
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:255'],
            'statement_received' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['statement_received'] = $request->boolean('statement_received');

        $vendorStatement->update($validated);

        return response()->json([
            'message' => 'Vendor statement updated successfully',
            'vendor_statement' => $vendorStatement->load('creator')
        ]);
    }

    public function toggleReceived(Request $request, VendorStatement $vendorStatement)
    {
        $vendorStatement->update([
            'statement_received' => !$vendorStatement->statement_received
        ]);

        return response()->json([
            'message' => 'Statement received status toggled',
            'vendor_statement' => $vendorStatement->load('creator')
        ]);
    }

    public function destroy(VendorStatement $vendorStatement)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Only administrators can delete records'], 403);
        }
        $vendorStatement->delete();
        return response()->json(['message' => 'Vendor statement tracker record deleted successfully']);
    }
}
