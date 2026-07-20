<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Activity;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'categoryRelation']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                              ->orderBy('created_at', 'desc')
                              ->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'             => ['required', 'string', 'in:inflow,outflow'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'category'         => ['nullable', 'string', 'max:255'],
            'category_id'      => ['nullable', 'integer', 'exists:categories,id'],
            'description'      => ['required', 'string'],
            'transaction_date' => ['required', 'date'],
        ]);

        // If category_id provided but no category name, resolve from model
        if (!empty($validated['category_id']) && empty($validated['category'])) {
            $cat = \App\Models\Category::find($validated['category_id']);
            $validated['category'] = $cat ? $cat->name : '';
        }

        $transaction = Auth::user()->transactions()->create($validated);

        // Auto-create a corresponding activity log entry for financial audits
        $typeLabel = $validated['type'] === 'inflow' ? 'Received Inflow' : 'Disbursed Outflow';
        $categoryName = $validated['category'] ?? 'Uncategorised';
        Auth::user()->activities()->create([
            'type'             => 'expense_payment',
            'details'          => "[Auto-Logged Transaction] {$typeLabel} of ₹" . number_format($validated['amount'], 2) . " for category '{$categoryName}'. Details: {$validated['description']}",
            'reference_number' => "TXN-{$transaction->id}",
            'logged_at'        => now(),
        ]);

        return response()->json([
            'message'     => 'Transaction recorded in Day Book successfully',
            'transaction' => $transaction->load(['user', 'categoryRelation']),
        ], 201);
    }

    public function dashboardStats()
    {
        $today   = Carbon::today();
        $weekAgo = Carbon::today()->subDays(6)->startOfDay();

        // --- Today's totals (2 queries) ---
        $todayInflow  = Transaction::whereDate('transaction_date', $today)->where('type', 'inflow')->sum('amount');
        $todayOutflow = Transaction::whereDate('transaction_date', $today)->where('type', 'outflow')->sum('amount');
        $netChange    = $todayInflow - $todayOutflow;

        $activityCountToday = Activity::whereDate('logged_at', $today)->count();
        $pendingTasksCount  = Task::where('status', 'pending')->count();

        // --- 7-day chart: 2 grouped queries instead of 14 individual ones ---
        $rawInflows = Transaction::selectRaw('DATE(transaction_date) as date, SUM(amount) as total')
            ->where('type', 'inflow')
            ->whereBetween('transaction_date', [$weekAgo, $today->endOfDay()])
            ->groupBy('date')
            ->pluck('total', 'date');

        $rawOutflows = Transaction::selectRaw('DATE(transaction_date) as date, SUM(amount) as total')
            ->where('type', 'outflow')
            ->whereBetween('transaction_date', [$weekAgo, $today->endOfDay()])
            ->groupBy('date')
            ->pluck('total', 'date');

        // Build the labelled chart array from the aggregated results
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = Carbon::today()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date'    => $dateStr,
                'label'   => $date->format('D, M d'),
                'inflow'  => (float) ($rawInflows[$dateStr]  ?? 0),
                'outflow' => (float) ($rawOutflows[$dateStr] ?? 0),
            ];
        }

        return response()->json([
            'today_inflow'          => (float) $todayInflow,
            'today_outflow'         => (float) $todayOutflow,
            'net_change'            => (float) $netChange,
            'activities_count_today'=> $activityCountToday,
            'pending_tasks_count'   => $pendingTasksCount,
            'chart_data'            => $chartData,
        ]);
    }
}
