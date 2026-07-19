<?php

namespace App\Http\Controllers;

use App\Models\CargoLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CargoLogController extends Controller
{
    public function index(Request $request)
    {
        $query = CargoLog::with('creator');

        if ($request->filled('cargo_name')) {
            $query->where('cargo_name', 'like', '%' . $request->cargo_name . '%');
        }

        if ($request->filled('party_name')) {
            $query->where('party_name', 'like', '%' . $request->party_name . '%');
        }

        if ($request->filled('bill_no')) {
            $query->where('bill_no', 'like', '%' . $request->bill_no . '%');
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $logs = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'cargo_name' => ['required', 'string', 'max:255'],
            'party_name' => ['nullable', 'string', 'max:255'],
            'part_count' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'phone_no' => ['nullable', 'string', 'max:50'],
            'bill_no' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', 'string', 'in:pending,paid'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = Auth::id();
        if (empty($validated['payment_status'])) {
            $validated['payment_status'] = 'pending';
        }

        $log = CargoLog::create($validated);

        return response()->json([
            'message' => 'Cargo log recorded successfully',
            'cargo_log' => $log->load('creator')
        ], 201);
    }

    public function update(Request $request, CargoLog $cargoLog)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'cargo_name' => ['required', 'string', 'max:255'],
            'party_name' => ['nullable', 'string', 'max:255'],
            'part_count' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'phone_no' => ['nullable', 'string', 'max:50'],
            'bill_no' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', 'string', 'in:pending,paid'],
            'notes' => ['nullable', 'string'],
        ]);

        $cargoLog->update($validated);

        return response()->json([
            'message' => 'Cargo log updated successfully',
            'cargo_log' => $cargoLog->load('creator')
        ]);
    }

    public function markPaid(Request $request, CargoLog $cargoLog)
    {
        $cargoLog->update([
            'payment_status' => 'paid'
        ]);

        return response()->json([
            'message' => 'Cargo shipment marked as paid',
            'cargo_log' => $cargoLog->load('creator')
        ]);
    }

    public function destroy(CargoLog $cargoLog)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Only administrators can delete cargo logs'], 403);
        }

        $cargoLog->delete();
        return response()->json(['message' => 'Cargo log deleted successfully']);
    }
}
