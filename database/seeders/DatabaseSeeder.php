<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Activity;
use App\Models\Transaction;
use App\Models\Task;
use App\Models\Category;
use App\Models\Designation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Designations
        $designations = [
            ['name' => 'Store Manager',       'description' => 'Manages overall shop operations and staff'],
            ['name' => 'Accountant',           'description' => 'Handles all accounts, day book, and reconciliations'],
            ['name' => 'Sales Executive',      'description' => 'Manages customer sales and follow-ups'],
            ['name' => 'Procurement Officer',  'description' => 'Handles supplier orders and purchase follow-ups'],
            ['name' => 'Delivery Coordinator', 'description' => 'Manages logistics and dispatch operations'],
        ];
        $designationModels = [];
        foreach ($designations as $d) {
            $designationModels[$d['name']] = Designation::create($d);
        }

        // 2. Seed Categories
        $categoryData = [
            // Inflow
            ['name' => 'Customer Sale',        'type' => 'inflow'],
            ['name' => 'Deposit Received',      'type' => 'inflow'],
            ['name' => 'Interest / Refund',     'type' => 'inflow'],
            ['name' => 'Owner Capital',         'type' => 'inflow'],
            ['name' => 'Advance Payment',       'type' => 'inflow'],
            // Outflow
            ['name' => 'Supplier Payment',      'type' => 'outflow'],
            ['name' => 'Petty Cash Expense',    'type' => 'outflow'],
            ['name' => 'Freight / Delivery',    'type' => 'outflow'],
            ['name' => 'Rent & Utilities',      'type' => 'outflow'],
            ['name' => 'Staff Salary',          'type' => 'outflow'],
            ['name' => 'Office Supplies',       'type' => 'outflow'],
            ['name' => 'Maintenance & Repair',  'type' => 'outflow'],
        ];
        $categoryModels = [];
        foreach ($categoryData as $c) {
            $categoryModels[$c['name']] = Category::create($c);
        }

        // 3. Create Users
        $admin = User::create([
            'name'           => 'John (Admin)',
            'email'          => 'admin@balancely.in',
            'password'       => Hash::make('password'),
            'role'           => 'admin',
            'designation_id' => $designationModels['Store Manager']->id,
        ]);

        $staff = User::create([
            'name'           => 'Sarah (Accounts)',
            'email'          => 'staff@balancely.in',
            'password'       => Hash::make('password'),
            'role'           => 'staff',
            'designation_id' => $designationModels['Accountant']->id,
        ]);

        // 2. Seed Activities
        $activities = [
            [
                'user_id' => $staff->id,
                'type' => 'cash_reconciliation',
                'details' => 'Performed morning cash drawer count. Opening balance: ₹200.00. Matches terminal summary.',
                'reference_number' => 'Drawer #1',
                'logged_at' => Carbon::now()->subHours(8),
            ],
            [
                'user_id' => $staff->id,
                'type' => 'supplier_followup',
                'details' => 'Called Century Plywood regarding delayed delivery of 18mm teak sheets. Expected delivery rescheduled to tomorrow morning.',
                'reference_number' => 'PO-2026-904',
                'logged_at' => Carbon::now()->subHours(6),
            ],
            [
                'user_id' => $staff->id,
                'type' => 'customer_inquiry',
                'details' => 'Inquired with client Mr. Sharma about pending clearance of ₹1,250.00 for custom wardrobe hardware fittings.',
                'reference_number' => 'INV-7843',
                'logged_at' => Carbon::now()->subHours(4),
            ],
            [
                'user_id' => $admin->id,
                'type' => 'reconciliation',
                'details' => 'Reviewed day-end statement and cross-checked credit card payments with payment gateway dashboard. Reconciled ₹3,450.00.',
                'reference_number' => 'STR-2026-07-17',
                'logged_at' => Carbon::now()->subHours(2),
            ],
            [
                'user_id' => $staff->id,
                'type' => 'internal_note',
                'details' => 'Noted drawer shift hand-over. Total physical cash handed over: ₹450.00.',
                'reference_number' => 'Drawer #1',
                'logged_at' => Carbon::now()->subMinutes(30),
            ]
        ];

        foreach ($activities as $act) {
            Activity::create($act);
        }

        // 4. Seed Transactions (Day Book)
        $transactions = [
            [
                'user_id'          => $staff->id,
                'type'             => 'inflow',
                'amount'           => 4500.00,
                'category'         => 'Customer Sale',
                'category_id'      => $categoryModels['Customer Sale']->id,
                'description'      => 'Received payment from client Mrs. Roy for kitchen modular fittings (Invoice #K-9087).',
                'transaction_date' => Carbon::today(),
            ],
            [
                'user_id'          => $staff->id,
                'type'             => 'outflow',
                'amount'           => 1200.00,
                'category'         => 'Supplier Payment',
                'category_id'      => $categoryModels['Supplier Payment']->id,
                'description'      => 'Settled invoice with Apex Paints for customized paint stocks delivery.',
                'transaction_date' => Carbon::today(),
            ],
            [
                'user_id'          => $staff->id,
                'type'             => 'outflow',
                'amount'           => 150.00,
                'category'         => 'Petty Cash Expense',
                'category_id'      => $categoryModels['Petty Cash Expense']->id,
                'description'      => 'Disbursed cash for local loader daily wages & helper lunch.',
                'transaction_date' => Carbon::today(),
            ],
            [
                'user_id'          => $admin->id,
                'type'             => 'inflow',
                'amount'           => 1250.00,
                'category'         => 'Customer Sale',
                'category_id'      => $categoryModels['Customer Sale']->id,
                'description'      => 'Received online bank transfer clearance from Mr. Sharma for custom drawer slides.',
                'transaction_date' => Carbon::today(),
            ],
            [
                'user_id'          => $staff->id,
                'type'             => 'inflow',
                'amount'           => 3200.00,
                'category'         => 'Deposit Received',
                'category_id'      => $categoryModels['Deposit Received']->id,
                'description'      => 'Collected deposit payment for premium dining table base hardware.',
                'transaction_date' => Carbon::yesterday(),
            ],
            [
                'user_id'          => $staff->id,
                'type'             => 'outflow',
                'amount'           => 850.00,
                'category'         => 'Freight / Delivery',
                'category_id'      => $categoryModels['Freight / Delivery']->id,
                'description'      => 'Paid local truck delivery services for dispatching 12 interior door frames.',
                'transaction_date' => Carbon::yesterday(),
            ],
            [
                'user_id'          => $staff->id,
                'type'             => 'outflow',
                'amount'           => 300.00,
                'category'         => 'Rent & Utilities',
                'category_id'      => $categoryModels['Rent & Utilities']->id,
                'description'      => 'Paid internet lease-line monthly subscription charges.',
                'transaction_date' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($transactions as $tx) {
            Transaction::create($tx);
        }

        // 4. Seed Tasks
        $tasks = [
            [
                'user_id' => $staff->id,
                'title' => 'Verify Century Plywood Teak sheets delivery',
                'description' => 'Ensure delivery counts match ordered item sheet (18mm, 12mm) and log any damage claims.',
                'due_date' => Carbon::today(),
                'status' => 'pending',
            ],
            [
                'user_id' => $staff->id,
                'title' => 'Collect pending draft check from Roy Interiors',
                'description' => 'Follow up at 2 PM to receive the bank check for the modular cabinet delivery.',
                'due_date' => Carbon::today(),
                'status' => 'pending',
            ],
            [
                'user_id' => $staff->id,
                'title' => 'Perform weekly bank drawer deposit',
                'description' => 'Deposit excess physical cash (₹3,500.00) in the HDFC Bank shop account.',
                'due_date' => Carbon::today()->addDay(),
                'status' => 'pending',
            ],
            [
                'user_id' => $admin->id,
                'title' => 'Submit monthly GST invoice reconciliation',
                'description' => 'Prepare sales-purchase excel and email to Auditor Mr. Rao.',
                'due_date' => Carbon::today()->addDays(3),
                'status' => 'pending',
            ],
            [
                'user_id' => $staff->id,
                'title' => 'Count safe cash drawer contents',
                'description' => 'Reconciled safe cash at beginning of the week.',
                'due_date' => Carbon::yesterday(),
                'status' => 'completed',
                'completed_at' => Carbon::yesterday()->addHours(9),
            ]
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
