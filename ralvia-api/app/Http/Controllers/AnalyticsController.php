<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\AiService;
use App\Services\InvoicePriorityService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function overview(
        Request $request,
        InvoicePriorityService $priorityService
    ) {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::with('customer')
            ->whereHas('customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->get();

        $aging = [
            '0_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            '90_plus' => 0,
        ];

        $totalReceivable = 0;
        $totalOverdue = 0;
        $paidAmount = 0;
        $pendingAmount = 0;

        foreach ($invoices as $invoice) {
            $invoice = $priorityService->analyze($invoice);

            $amount = (float) $invoice->amount;

            if ($invoice->status === 'paid') {
                $paidAmount += $amount;
                continue;
            }

            // Money still owed to the business
            $totalReceivable += $amount;

            if ($invoice->status === 'overdue') {
                $totalOverdue += $amount;

                if ($invoice->days_overdue <= 30) {
                    $aging['0_30'] += $amount;
                } elseif ($invoice->days_overdue <= 60) {
                    $aging['31_60'] += $amount;
                } elseif ($invoice->days_overdue <= 90) {
                    $aging['61_90'] += $amount;
                } else {
                    $aging['90_plus'] += $amount;
                }
            } else {
                $pendingAmount += $amount;
            }
        }
        $monthly = [];

        foreach ($invoices as $invoice) {
            $month = $invoice->issue_date->format('Y-m');

            if (!isset($monthly[$month])) {
                $monthly[$month] = 0;
            }

            $monthly[$month] += (float) $invoice->amount;
        }

        ksort($monthly);

        $monthlyData = [];

        foreach ($monthly as $month => $amount) {
            $monthlyData[] = [
                'month' => $month,
                'amount' => $amount,
            ];
        }

        return response()->json([
            'summary' => [
                'total_receivable' => $totalReceivable,
                'total_overdue' => $totalOverdue,
                'paid_amount' => $paidAmount,
                'pending_amount' => $pendingAmount,
            ],

            'aging' => [
                [
                    'label' => '0-30 days',
                    'amount' => $aging['0_30'],
                ],
                [
                    'label' => '31-60 days',
                    'amount' => $aging['31_60'],
                ],
                [
                    'label' => '61-90 days',
                    'amount' => $aging['61_90'],
                ],
                [
                    'label' => '90+ days',
                    'amount' => $aging['90_plus'],
                ],
            ],
            'monthly' => $monthlyData
        ]);
    }
    public function explain(
    Request $request,
    InvoicePriorityService $priorityService,
    AiService $aiService
) {
    $validated = $request->validate([
        'language' => 'required|in:en,ar',
    ]);

    $language = $validated['language'];

    $companyId = $request->user()->company_id;

    $invoices = Invoice::with('customer')
        ->whereHas('customer', function ($query) use ($companyId) {
            $query->where('company_id', $companyId);
        })
        ->get();

    $aging = [
        '0_30' => 0,
        '31_60' => 0,
        '61_90' => 0,
        '90_plus' => 0,
    ];

    foreach ($invoices as $invoice) {
        $invoice = $priorityService->analyze($invoice);

        if ($invoice->status !== 'overdue') {
            continue;
        }

        $amount = (float) $invoice->amount;

        if ($invoice->days_overdue <= 30) {
            $aging['0_30'] += $amount;
        } elseif ($invoice->days_overdue <= 60) {
            $aging['31_60'] += $amount;
        } elseif ($invoice->days_overdue <= 90) {
            $aging['61_90'] += $amount;
        } else {
            $aging['90_plus'] += $amount;
        }
    }

    $agingData = [
        ['label' => '0-30 days', 'amount' => $aging['0_30']],
        ['label' => '31-60 days', 'amount' => $aging['31_60']],
        ['label' => '61-90 days', 'amount' => $aging['61_90']],
        ['label' => '90+ days', 'amount' => $aging['90_plus']],
    ];

    return response()->json(
        $aiService->explainAnalytics(
            $agingData,
            $language
        )
    );
}
}