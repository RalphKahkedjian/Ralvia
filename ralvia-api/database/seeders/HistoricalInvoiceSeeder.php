<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HistoricalInvoiceSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Get Lee's deployed account
        |--------------------------------------------------------------------------
        */

        $user = User::where(
            'email',
            'lee@gmail.com'
        )->firstOrFail();

        $company = $user->company;

        if (!$company) {
            $this->command->error(
                'The selected user does not belong to a company.'
            );

            return;
        }

        $this->command->info(
            "Seeding ML data for: {$company->name}"
        );

        /*
        |--------------------------------------------------------------------------
        | 2. Create 3 customers with different payment behaviour
        |--------------------------------------------------------------------------
        */

        $goodCustomer = Customer::firstOrCreate(
            [
                'company_id' => $company->id,
                'name' => 'Atlas Trading',
            ],
            [
                'email' => 'atlas@example.com',
                'phone' => '+96170000001',
            ]
        );

        $averageCustomer = Customer::firstOrCreate(
            [
                'company_id' => $company->id,
                'name' => 'Cedars Solutions',
            ],
            [
                'email' => 'cedars@example.com',
                'phone' => '+96170000002',
            ]
        );

        $riskyCustomer = Customer::firstOrCreate(
            [
                'company_id' => $company->id,
                'name' => 'Levant Retail',
            ],
            [
                'email' => 'levant@example.com',
                'phone' => '+96170000003',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | 3. Define customer payment profiles
        |--------------------------------------------------------------------------
        */

        $customerProfiles = [
            [
                'customer' => $goodCustomer,
                'min_delay' => -10,
                'max_delay' => 4,
            ],
            [
                'customer' => $averageCustomer,
                'min_delay' => -3,
                'max_delay' => 15,
            ],
            [
                'customer' => $riskyCustomer,
                'min_delay' => 5,
                'max_delay' => 35,
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | 4. Start 24 months ago
        |--------------------------------------------------------------------------
        */

        $startDate = Carbon::now()
            ->subMonths(23)
            ->startOfMonth();

        $created = 0;

        /*
        |--------------------------------------------------------------------------
        | 5. Generate 24 months of historical PAID invoices
        |--------------------------------------------------------------------------
        */

        for ($month = 0; $month < 24; $month++) {
            $currentMonth = $startDate
                ->copy()
                ->addMonths($month);

            foreach ($customerProfiles as $profileIndex => $profile) {
                $customer = $profile['customer'];

                /*
                | 3 invoices per customer per month
                */

                for ($i = 1; $i <= 3; $i++) {
                    $issueDate = $currentMonth
                        ->copy()
                        ->addDays(($i - 1) * 7);

                    /*
                    |--------------------------------------------------------------------------
                    | Payment terms
                    |--------------------------------------------------------------------------
                    */

                    $paymentTermsOptions = [
                        15,
                        30,
                        45,
                    ];

                    $paymentTerms =
                        $paymentTermsOptions[
                            array_rand($paymentTermsOptions)
                        ];

                    $dueDate = $issueDate
                        ->copy()
                        ->addDays($paymentTerms);

                    /*
                    |--------------------------------------------------------------------------
                    | Invoice amount
                    |--------------------------------------------------------------------------
                    */

                    $baseAmount = match ($profileIndex) {
                        0 => 1200,
                        1 => 3000,
                        default => 6000,
                    };

                    /*
                    | Small upward trend through time
                    */

                    $trend = $month * 80;

                    /*
                    | Prevent every invoice from looking identical
                    */

                    $randomVariation = rand(
                        -400,
                        900
                    );

                    $amount = max(
                        300,
                        $baseAmount
                        + $trend
                        + $randomVariation
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Payment behaviour
                    |--------------------------------------------------------------------------
                    */

                    $paymentDelay = rand(
                        $profile['min_delay'],
                        $profile['max_delay']
                    );

                    $paidAt = $dueDate
                        ->copy()
                        ->addDays($paymentDelay);

                    /*
                    |--------------------------------------------------------------------------
                    | Invoice number
                    |--------------------------------------------------------------------------
                    */

                    $invoiceNumber =
                        'ML-' .
                        $company->id .
                        '-' .
                        $currentMonth->format('Ym') .
                        '-' .
                        ($profileIndex + 1) .
                        '-' .
                        $i;

                    /*
                    |--------------------------------------------------------------------------
                    | Save invoice
                    |--------------------------------------------------------------------------
                    */

                    Invoice::updateOrCreate(
                        [
                            'customer_id' =>
                                $customer->id,

                            'invoice_number' =>
                                $invoiceNumber,
                        ],
                        [
                            'amount' => $amount,

                            'issue_date' =>
                                $issueDate,

                            'due_date' =>
                                $dueDate,

                            'paid_at' =>
                                $paidAt,

                            'status' =>
                                'paid',
                        ]
                    );

                    $created++;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Create current OVERDUE invoices
        |--------------------------------------------------------------------------
        |
        | These are unpaid invoices so the dashboard,
        | overdue counters, Action Center and Risk Intelligence
        | have meaningful live data.
        |
        */

        $overdueInvoices = [
            [
                'customer' => $averageCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-001',
                'amount' => 6500,
                'issue_days_ago' => 50,
                'due_days_ago' => 20,
            ],

            [
                'customer' => $averageCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-002',
                'amount' => 7800,
                'issue_days_ago' => 65,
                'due_days_ago' => 35,
            ],

            [
                'customer' => $riskyCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-003',
                'amount' => 9200,
                'issue_days_ago' => 70,
                'due_days_ago' => 40,
            ],

            [
                'customer' => $riskyCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-004',
                'amount' => 11500,
                'issue_days_ago' => 90,
                'due_days_ago' => 60,
            ],

            [
                'customer' => $riskyCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-005',
                'amount' => 12000,
                'issue_days_ago' => 105,
                'due_days_ago' => 75,
            ],
        ];

        $overdueCreated = 0;

        foreach ($overdueInvoices as $invoiceData) {
            $issueDate = Carbon::now()
                ->subDays(
                    $invoiceData['issue_days_ago']
                );

            $dueDate = Carbon::now()
                ->subDays(
                    $invoiceData['due_days_ago']
                );

            Invoice::updateOrCreate(
                [
                    'customer_id' =>
                        $invoiceData['customer']->id,

                    'invoice_number' =>
                        $invoiceData['invoice_number'],
                ],
                [
                    'amount' =>
                        $invoiceData['amount'],

                    'issue_date' =>
                        $issueDate,

                    'due_date' =>
                        $dueDate,

                    'paid_at' =>
                        null,

                    'status' =>
                        'overdue',
                ]
            );

            $overdueCreated++;
        }

        /*
        |--------------------------------------------------------------------------
        | 7. Create a couple of upcoming pending invoices
        |--------------------------------------------------------------------------
        */

        $pendingInvoices = [
            [
                'customer' => $goodCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-006',
                'amount' => 6400,
                'issue_days_ago' => 5,
                'due_days_from_now' => 25,
            ],

            [
                'customer' => $averageCustomer,
                'invoice_number' =>
                    'LIVE-' . $company->id . '-007',
                'amount' => 7000,
                'issue_days_ago' => 10,
                'due_days_from_now' => 20,
            ],
        ];

        $pendingCreated = 0;

        foreach ($pendingInvoices as $invoiceData) {
            $issueDate = Carbon::now()
                ->subDays(
                    $invoiceData['issue_days_ago']
                );

            $dueDate = Carbon::now()
                ->addDays(
                    $invoiceData['due_days_from_now']
                );

            Invoice::updateOrCreate(
                [
                    'customer_id' =>
                        $invoiceData['customer']->id,

                    'invoice_number' =>
                        $invoiceData['invoice_number'],
                ],
                [
                    'amount' =>
                        $invoiceData['amount'],

                    'issue_date' =>
                        $issueDate,

                    'due_date' =>
                        $dueDate,

                    'paid_at' =>
                        null,

                    'status' =>
                        'pending',
                ]
            );

            $pendingCreated++;
        }

        /*
        |--------------------------------------------------------------------------
        | 8. Seeder summary
        |--------------------------------------------------------------------------
        */

        $this->command->info(
            "{$created} historical invoices seeded."
        );

        $this->command->info(
            "{$overdueCreated} overdue invoices seeded."
        );

        $this->command->info(
            "{$pendingCreated} pending invoices seeded."
        );

        $this->command->info(
            "Demo data successfully seeded for company {$company->name}."
        );
    }
}