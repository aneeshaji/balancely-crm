<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::define('admin-only', function ($user) {
            return $user->role === 'admin';
        });

        // Register Audit Observers
        \App\Models\User::observe(\App\Observers\AuditObserver::class);
        \App\Models\Transaction::observe(\App\Observers\AuditObserver::class);
        \App\Models\Task::observe(\App\Observers\AuditObserver::class);
        \App\Models\SalaryAdvance::observe(\App\Observers\AuditObserver::class);
        \App\Models\CargoLog::observe(\App\Observers\AuditObserver::class);
        \App\Models\VendorStatement::observe(\App\Observers\AuditObserver::class);
        \App\Models\ChequeEntry::observe(\App\Observers\AuditObserver::class);
        \App\Models\Category::observe(\App\Observers\AuditObserver::class);
        \App\Models\Designation::observe(\App\Observers\AuditObserver::class);
    }
}
