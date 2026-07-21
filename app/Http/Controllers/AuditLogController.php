<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs WITH summary stats in a single DB roundtrip.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,name,role');

        if ($request->filled('event_group')) {
            $group = $request->event_group;
            if ($group === 'auth') {
                $query->where('event_type', 'like', 'auth.%');
            } elseif ($group === 'error') {
                $query->where('event_type', 'system.error');
            } elseif ($group === 'crud') {
                $query->where(function ($q) {
                    $q->where('event_type', 'not like', 'auth.%')
                      ->where('event_type', '!=', 'system.error');
                });
            }
        }

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('event_type', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
                  // NOTE: Removed payload LIKE search — JSON LIKE scan is extremely slow on large tables.
                  // Payload is for display only; searching event_type + description is sufficient.
            });
        }

        $perPage = min((int) $request->get('per_page', 25), 100);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // --- Inline summary counts (single aggregated query, not 4 separate API calls) ---
        // Run only when no filters are applied (i.e., the main page load with no group/user/date/search)
        $summaryStats = null;
        $hasFilters = $request->filled('event_group') || $request->filled('user_id')
                   || $request->filled('date') || $request->filled('search');

        if (!$hasFilters) {
            $raw = DB::table('audit_logs')
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN event_type LIKE 'auth.%' THEN 1 ELSE 0 END) as auth_count,
                    SUM(CASE WHEN event_type NOT LIKE 'auth.%' AND event_type != 'system.error' THEN 1 ELSE 0 END) as crud_count,
                    SUM(CASE WHEN event_type = 'system.error' THEN 1 ELSE 0 END) as error_count
                ")
                ->first();

            $summaryStats = [
                'total'      => (int) $raw->total,
                'authCount'  => (int) $raw->auth_count,
                'crudCount'  => (int) $raw->crud_count,
                'errorCount' => (int) $raw->error_count,
            ];
        }

        $response = $logs->toArray();
        $response['summary'] = $summaryStats;

        return response()->json($response);
    }

    /**
     * Purge audit logs.
     */
    public function destroyAll(Request $request)
    {
        $validated = $request->validate([
            'retention' => ['required', 'string', 'in:all,7,30,90'],
        ]);

        $retention = $validated['retention'];

        if ($retention === 'all') {
            AuditLog::truncate();
            $msg = 'All audit logs have been successfully cleared.';
        } else {
            $days = (int) $retention;
            $cutoff = now()->subDays($days);
            
            $deletedCount = AuditLog::where('created_at', '<', $cutoff)->delete();
            $msg = "Successfully cleared {$deletedCount} audit logs older than {$days} days.";
        }

        // Record this clear action as a fresh audit log entry
        AuditLog::record(
            'system.audit_cleared',
            "Audit logs cleared by admin. Retention policy applied: {$retention}.",
            ['retention' => $retention]
        );

        return response()->json([
            'message' => $msg,
        ]);
    }
}
