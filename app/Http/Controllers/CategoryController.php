<?php
 
namespace App\Http\Controllers;
 
use App\Models\Category;
use Illuminate\Http\Request;
 
class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('type', 'asc')->orderBy('name', 'asc')->get();
        return response()->json($categories);
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories'],
            'type' => ['required', 'string', 'in:inflow,outflow'],
        ]);
 
        $category = Category::create($validated);
 
        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }
 
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'type' => ['required', 'string', 'in:inflow,outflow'],
        ]);
 
        $category->update($validated);
 
        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category,
        ]);
    }
 
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
