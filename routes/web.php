<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SalaryAdvanceController;
use App\Http\Controllers\CargoLogController;
use App\Http\Controllers\VendorStatementController;
use App\Http\Controllers\ChequeRegisterController;
use Illuminate\Support\Facades\Route;

// API Authentication Routes
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/api/me', [AuthController::class, 'me'])->middleware('auth');

// CRM Secure API Routes
Route::middleware('auth')->group(function () {
    Route::apiResource('/api/activities', ActivityController::class)->only(['index', 'store']);
    Route::apiResource('/api/transactions', TransactionController::class)->only(['index', 'store']);
    Route::get('/api/dashboard/stats', [TransactionController::class, 'dashboardStats']);
    Route::apiResource('/api/tasks', TaskController::class);
    Route::put('/api/tasks/{task}/toggle', [TaskController::class, 'toggleStatus']);
    
    // 4 New Excel modules
    Route::apiResource('/api/salary-advances', SalaryAdvanceController::class);
    Route::apiResource('/api/cargo-logs', CargoLogController::class);
    Route::put('/api/cargo-logs/{cargoLog}/pay', [CargoLogController::class, 'markPaid']);
    Route::apiResource('/api/vendor-statements', VendorStatementController::class);
    Route::put('/api/vendor-statements/{vendorStatement}/toggle', [VendorStatementController::class, 'toggleReceived']);
    Route::apiResource('/api/cheques', ChequeRegisterController::class);
    
    // User Profile Routes
    Route::get('/api/profile', [ProfileController::class, 'show']);
    Route::put('/api/profile', [ProfileController::class, 'update']);
    Route::put('/api/profile/password', [ProfileController::class, 'changePassword']);

    // Master Data Category & Designation Read Routes (Accessible to all staff)
    Route::get('/api/categories', [CategoryController::class, 'index']);
    Route::get('/api/designations', [DesignationController::class, 'index']);

    // Admin only routes
    Route::middleware('can:admin-only')->group(function () {
        Route::get('/api/staff', [StaffController::class, 'index']);
        Route::post('/api/staff', [StaffController::class, 'store']);
        
        // Master Data Category & Designation Write Routes
        Route::apiResource('/api/categories', CategoryController::class)->except(['index']);
        Route::apiResource('/api/designations', DesignationController::class)->except(['index']);
    });
});

// Single Page Application Fallback
Route::get('{any?}', function () {
    return view('app');
})->where('any', '.*');
