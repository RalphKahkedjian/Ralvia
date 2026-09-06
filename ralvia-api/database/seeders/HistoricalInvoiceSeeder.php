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
        | 1. Get the newest user/account
        |--------------------------------------------------------------------------
        |
        | Since you just created a new Ralvia account, we use the latest user
        | and get their company.
        |
        */

        $user = User::where(
    'email',
    'lee@gmail.com'
)->firstOrFail();

        $company = $user->company;

        if (!$company) {
            $this->command->error(
                'The latest user does not belong to a company.'
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
        |
        | Negative delay = pays before due date
        | 0              = pays on due date
        | Positive delay = pays after due date
        |
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
        | 5. Generate 24 months of historical invoices
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
                    |
                    | Include company ID so demo data from different companies
                    | has clearly distinguishable invoice numbers.
                    |
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

        $this->command->info(
            "{$created} historical invoices seeded for company {$company->name}."
        );
    }
}