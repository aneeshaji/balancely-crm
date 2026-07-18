<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with('user')
            ->orderBy('due_date', 'asc')
            ->orderBy('status', 'asc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
        ]);

        $task = Auth::user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        // Auto-create an activity log for task creation
        Auth::user()->activities()->create([
            'type' => 'internal_note',
            'details' => "Assigned a new task: '{$validated['title']}' (Due: {$validated['due_date']})",
            'reference_number' => "TASK-{$task->id}",
            'logged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task added successfully',
            'task' => $task->load('user'),
        ], 201);
    }

    public function toggleStatus(Task $task)
    {
        $newStatus = $task->status === 'completed' ? 'pending' : 'completed';
        
        $task->update([
            'status' => $newStatus,
            'completed_at' => $newStatus === 'completed' ? now() : null,
        ]);

        // Auto-create an activity log for task resolution
        $statusText = $newStatus === 'completed' ? 'completed' : 're-opened';
        Auth::user()->activities()->create([
            'type' => 'internal_note',
            'details' => "Marked task '{$task->title}' as {$statusText}.",
            'reference_number' => "TASK-{$task->id}",
            'logged_at' => now(),
        ]);

        return response()->json([
            'message' => "Task marked as {$newStatus}",
            'task' => $task->load('user'),
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }
}
