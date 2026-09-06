<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Invoice;

class FinanceInsightsService
{
    public function __construct(
        private AiService $aiService,
        private InvoiceRiskFeatureService $featureService
    ) {
    }

    public function build(int $companyId): array
    {
        /*
        |--------------------------------------------------------------------------
        | Load company data
        |--------------------------------------------------------------------------
        */

        $customers = Customer::where(
            'company_id',
            $companyId
        )->get();

        $invoices = Invoice::whereHas(
            'customer',
            fn ($query) =>
                $query->where(
                    'company_id',
                    $companyId
                )
        )
            ->with('customer')
            ->orderBy('issue_date')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Receivables
        |--------------------------------------------------------------------------
        */

        $unpaidInvoices = $invoices->filter(
            fn ($invoice) =>
                $invoice->status !== 'paid'
        );

        $outstandingReceivables =
            $unpaidInvoices->sum(
                fn ($invoice) =>
                    (float) $invoice->amount
            );

        /*
        |--------------------------------------------------------------------------
        | Customer payment behavior
        |--------------------------------------------------------------------------
        */

        $customerWarnings = [];

        foreach ($customers as $customer) {
            $paidInvoices = $customer
                ->invoices()
                ->where('status', 'paid')
                ->whereNotNull('paid_at')
                ->get();

            if ($paidInvoices->isEmpty()) {
                continue;
            }

            $lateInvoices = $paidInvoices->filter(
                fn ($invoice) =>
                    $invoice->paid_at->gt(
                        $invoice->due_date
                    )
            );

            $lateRate =
                $lateInvoices->count() /
                $paidInvoices->count();

            if ($lateRate >= 0.7) {
                $totalDaysLate =
                    $lateInvoices->sum(
                        fn ($invoice) =>
                            $invoice
                                ->due_date
                                ->diffInDays(
                                    $invoice->paid_at
                                )
                    );

                $averageDaysLate =
                    $totalDaysLate /
                    $paidInvoices->count();

                $customerWarnings[] = [
                    'customer_id' =>
                        $customer->id,

                    'customer_name' =>
                        $customer->name,

                    'paid_invoice_count' =>
                        $paidInvoices->count(),

                    'late_invoice_count' =>
                        $lateInvoices->count(),

                    'late_payment_rate' =>
                        round(
                            $lateRate,
                            4
                        ),

                    'average_days_late' =>
                        round(
                            $averageDaysLate,
                            2
                        ),
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Sort customer warnings
        |--------------------------------------------------------------------------
        */

        usort(
            $customerWarnings,
            fn ($a, $b) =>
                $b['late_payment_rate']
                <=>
                $a['late_payment_rate']
        );

        /*
        |--------------------------------------------------------------------------
        | Random Forest - high-risk receivables
        |--------------------------------------------------------------------------
        */

        $highRiskReceivables = [];

        if ($unpaidInvoices->isNotEmpty()) {
            $batch = [];

            foreach ($unpaidInvoices as $invoice) {
                $features =
                    $this->featureService->build(
                        $invoice
                    );

                $batch[] = [
                    'invoice_id' =>
                        $invoice->id,

                    ...$features,
                ];
            }

            $predictionResult =
                $this->aiService
                    ->predictInvoiceRiskBatch(
                        $batch
                    );

            $predictionsByInvoice =
                collect(
                    $predictionResult[
                        'predictions'
                    ] ?? []
                )->keyBy('invoice_id');

            foreach ($unpaidInvoices as $invoice) {
                $prediction =
                    $predictionsByInvoice->get(
                        $invoice->id
                    );

                if (!$prediction) {
                    continue;
                }

                if (
                    ($prediction['risk'] ?? null)
                    !== 'high'
                ) {
                    continue;
                }

                $highRiskReceivables[] = [
                    'invoice_id' =>
                        $invoice->id,

                    'invoice_number' =>
                        $invoice->invoice_number,

                    'customer_id' =>
                        $invoice->customer->id,

                    'customer_name' =>
                        $invoice->customer->name,

                    'amount' =>
                        (float) $invoice->amount,

                    'due_date' =>
                        $invoice
                            ->due_date
                            ->format('Y-m-d'),

                    'late_probability' =>
                        $prediction[
                            'late_probability'
                        ],

                    'risk' =>
                        $prediction['risk'],
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Sort high-risk invoices
        |--------------------------------------------------------------------------
        */

        usort(
            $highRiskReceivables,
            fn ($a, $b) =>
                $b['late_probability']
                <=>
                $a['late_probability']
        );

        /*
        |--------------------------------------------------------------------------
        | Prophet forecast
        |--------------------------------------------------------------------------
        */

        $forecast = null;

        if ($invoices->isNotEmpty()) {
            $invoiceData = $invoices
                ->map(function ($invoice) {
                    return [
                        'issue_date' =>
                            $invoice
                                ->issue_date
                                ->format('Y-m-d'),

                        'amount' =>
                            (float) $invoice->amount,
                    ];
                })
                ->values()
                ->toArray();

            $forecast =
                $this->aiService
                    ->forecastInvoices(
                        $invoiceData,
                        3
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Final Finance Insights response
        |--------------------------------------------------------------------------
        */

        return [
            'overview' => [
                'total_customers' =>
                    $customers->count(),

                'total_invoices' =>
                    $invoices->count(),

                'outstanding_receivables' =>
                    round(
                        $outstandingReceivables,
                        2
                    ),

                'unpaid_invoice_count' =>
                    $unpaidInvoices->count(),

                'customers_needing_attention' =>
                    count(
                        $customerWarnings
                    ),

                'high_risk_invoice_count' =>
                    count(
                        $highRiskReceivables
                    ),

                'high_risk_receivables' =>
                    round(
                        collect(
                            $highRiskReceivables
                        )->sum('amount'),
                        2
                    ),
            ],

            'high_risk_receivables' =>
                $highRiskReceivables,

            'customer_warnings' =>
                $customerWarnings,

            'forecast' =>
                $forecast,
        ];
    }
}