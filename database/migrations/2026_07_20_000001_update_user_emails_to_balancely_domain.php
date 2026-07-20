<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update all existing user emails from @shop.com to @balancely.in.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'like', '%@shop.com')
            ->get()
            ->each(function ($user) {
                $newEmail = str_replace('@shop.com', '@balancely.in', $user->email);
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['email' => $newEmail]);
            });
    }

    /**
     * Reverse the migration — restore @shop.com emails.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('email', 'like', '%@balancely.in')
            ->get()
            ->each(function ($user) {
                $oldEmail = str_replace('@balancely.in', '@shop.com', $user->email);
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['email' => $oldEmail]);
            });
    }
};
