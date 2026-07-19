<?php

namespace App\Http\Controllers;

use App\Models\ChequeEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChequeRegisterController extends Controller
{
    public function index(Request $request)
    {
        $query = ChequeEntry::with('creator');

        if ($request->filled('cheque_no')) {
            $query->where('cheque_no', 'like', '%' . $request->cheque_no . '%');
        }

        if ($request->filled('vendor_name')) {
            $query->where('vendor_name', 'like', '%' . $request->vendor_name . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            // Filter by cheque date or issue date
            $query->whereBetween('cheque_date', [$request->start_date, $request->end_date]);
        }

        $cheques = $query->orderBy('cheque_no', 'desc')->get();

        return response()->json($cheques);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'issue_date' => ['nullable', 'date'],
            'cheque_no' => ['required', 'string', 'max:255'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'cheque_date' => ['nullable', 'date'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:issued,cleared,bounced,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = Auth::id();

        $cheque = ChequeEntry::create($validated);

        return response()->json([
            'message' => 'Cheque record added successfully',
            'cheque' => $cheque->load('creator')
        ], 201);
    }

    public function update(Request $request, ChequeEntry $cheque)
    {
        $validated = $request->validate([
            'issue_date' => ['nullable', 'date'],
            'cheque_no' => ['required', 'string', 'max:255'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'cheque_date' => ['nullable', 'date'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:issued,cleared,bounced,cancelled'],
            'notes' => ['nullable', 'string'],
        ]);

        $cheque->update($validated);

        return response()->json([
            'message' => 'Cheque record updated successfully',
            'cheque' => $cheque->load('creator')
        ]);
    }

    public function destroy(ChequeEntry $cheque)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Only administrators can delete records'], 403);
        }
        $cheque->delete();
        return response()->json(['message' => 'Cheque record deleted successfully']);
    }
}
