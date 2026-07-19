<?php

namespace App\Http\Controllers;

use App\Models\SalaryAdvance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SalaryAdvanceController extends Controller
{
    public function index(Request $request)
    {
        $query = SalaryAdvance::with('creator');

        if ($request->filled('employee_name')) {
            $query->where('employee_name', 'like', '%' . $request->employee_name . '%');
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $advances = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();

        return response()->json($advances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'employee_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = Auth::id();

        $advance = SalaryAdvance::create($validated);

        return response()->json([
            'message' => 'Salary advance recorded successfully',
            'salary_advance' => $advance->load('creator')
        ], 201);
    }

    public function update(Request $request, SalaryAdvance $salaryAdvance)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'employee_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string'],
        ]);

        $salaryAdvance->update($validated);

        return response()->json([
            'message' => 'Salary advance updated successfully',
            'salary_advance' => $salaryAdvance->load('creator')
        ]);
    }

    public function destroy(SalaryAdvance $salaryAdvance)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Only administrators can delete records'], 403);
        }
        $salaryAdvance->delete();
        return response()->json(['message' => 'Salary advance deleted successfully']);
    }
}
