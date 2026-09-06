<?php

namespace App\Services;

use App\Models\Invoice;
use Carbon\Carbon;

class InvoiceRiskFeatureService
{
    public function build(Invoice $invoice): array
    {
        $issueDate = Carbon::parse(
            $invoice->issue_date
        );

        $dueDate = Carbon::parse(
            $invoice->due_date
        );

        $previousInvoices = Invoice::where(
            'customer_id',
            $invoice->customer_id
        )
            ->where('issue_date', '<', $issueDate)
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->get();

        $previousInvoiceCount =
            $previousInvoices->count();

        $lateCount = 0;
        $totalDaysLate = 0;
        $totalAmount = 0;

        foreach ($previousInvoices as $previous) {
            $previousDue = Carbon::parse(
                $previous->due_date
            );

            $previousPaid = Carbon::parse(
                $previous->paid_at
            );

            if ($previousPaid->gt($previousDue)) {
                $lateCount++;

                $totalDaysLate +=
                    $previousDue->diffInDays(
                        $previousPaid
                    );
            }

            $totalAmount +=
                (float) $previous->amount;
        }

        if ($previousInvoiceCount > 0) {
            $previousLateRate =
                $lateCount /
                $previousInvoiceCount;

            $previousAvgDaysLate =
                $totalDaysLate /
                $previousInvoiceCount;

            $previousAvgAmount =
                $totalAmount /
                $previousInvoiceCount;

            $amountVsCustomerAverage =
                $previousAvgAmount > 0
                    ? (float) $invoice->amount /
                        $previousAvgAmount
                    : 1.0;
        } else {
            $previousLateRate = 0.0;
            $previousAvgDaysLate = 0.0;
            $amountVsCustomerAverage = 1.0;
        }

        return [
            'amount' =>
                (float) $invoice->amount,

            'payment_terms_days' =>
                $issueDate->diffInDays(
                    $dueDate
                ),

            'issue_month' =>
                $issueDate->month,

            'previous_invoice_count' =>
                $previousInvoiceCount,

            'previous_late_rate' =>
                $previousLateRate,

            'previous_avg_days_late' =>
                $previousAvgDaysLate,

            'amount_vs_customer_average' =>
                $amountVsCustomerAverage,
        ];
    }
}