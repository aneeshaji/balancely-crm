<?php
 
namespace App\Http\Controllers;
 
use App\Models\Designation;
use Illuminate\Http\Request;
 
class DesignationController extends Controller
{
    public function index()
    {
        $designations = Designation::orderBy('name', 'asc')->get();
        return response()->json($designations);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:designations'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);
 
        $designation = Designation::create($validated);
 
        return response()->json([
            'message' => 'Designation created successfully',
            'designation' => $designation,
        ], 201);
    }
 
    public function update(Request $request, Designation $designation)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:designations,name,' . $designation->id],
            'description' => ['nullable', 'string', 'max:500'],
        ]);
 
        $designation->update($validated);
 
        return response()->json([
            'message' => 'Designation updated successfully',
            'designation' => $designation,
        ]);
    }
 
    public function destroy(Designation $designation)
    {
        // Check if user is using it
        if ($designation->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete designation because it is assigned to staff members'
            ], 422);
        }
 
        $designation->delete();
        return response()->json([
            'message' => 'Designation deleted successfully'
        ]);
    }
}
