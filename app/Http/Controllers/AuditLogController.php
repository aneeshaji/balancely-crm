<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

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
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('payload', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($logs);
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

        // Record this clear action as a fresh audit log entry!
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
