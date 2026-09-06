<?php

namespace App\Services;

use App\Models\Customer;
use Carbon\Carbon;

class CustomerIntelligenceService
{
    public function analyze(Customer $customer): array
    {
        $invoices = $customer->invoices()
            ->orderBy('issue_date')
            ->get();

        $paidInvoices = $invoices
            ->filter(fn ($invoice) =>
                $invoice->status === 'paid'
                && $invoice->paid_at !== null
            );

        $totalInvoiced = $invoices->sum(
            fn ($invoice) => (float) $invoice->amount
        );

        $paidCount = $paidInvoices->count();

        $lateCount = 0;
        $totalDaysLate = 0;

        foreach ($paidInvoices as $invoice) {
            $dueDate = Carbon::parse(
                $invoice->due_date
            );

            $paidAt = Carbon::parse(
                $invoice->paid_at
            );

            if ($paidAt->gt($dueDate)) {
                $lateCount++;

                $totalDaysLate +=
                    $dueDate->diffInDays($paidAt);
            }
        }

        $lateRate = $paidCount > 0
            ? $lateCount / $paidCount
            : 0;

        $averageDaysLate = $paidCount > 0
            ? $totalDaysLate / $paidCount
            : 0;

            $invoiceHistory = $invoices
    ->sortByDesc('issue_date')
    ->map(function ($invoice) {
        $daysLate = null;
        $paymentOutcome = 'unpaid';

        if (
            $invoice->status === 'paid'
            && $invoice->paid_at !== null
        ) {
            $dueDate = Carbon::parse(
                $invoice->due_date
            );

            $paidAt = Carbon::parse(
                $invoice->paid_at
            );

            if ($paidAt->gt($dueDate)) {
                $daysLate =
                    $dueDate->diffInDays(
                        $paidAt
                    );

                $paymentOutcome = 'late';
            } else {
                $daysLate = 0;
                $paymentOutcome = 'on_time';
            }
        }

        return [
            'id' => $invoice->id,

            'invoice_number' =>
                $invoice->invoice_number,

            'amount' =>
                (float) $invoice->amount,

            'issue_date' =>
                Carbon::parse(
                    $invoice->issue_date
                )->format('Y-m-d'),

            'due_date' =>
                Carbon::parse(
                    $invoice->due_date
                )->format('Y-m-d'),

            'paid_at' =>
                $invoice->paid_at
                    ? Carbon::parse(
                        $invoice->paid_at
                    )->format('Y-m-d')
                    : null,

            'payment_outcome' =>
                $paymentOutcome,

            'days_late' =>
                $daysLate,
        ];
    })
    ->values();

        return [
          'customer' => [
              'id' => $customer->id,
              'name' => $customer->name,
              'email' => $customer->email,
          ],

          'metrics' => [
              'total_invoiced' =>
                  round($totalInvoiced, 2),

              'invoice_count' =>
                  $invoices->count(),

              'paid_invoice_count' =>
                  $paidCount,

              'late_invoice_count' =>
                  $lateCount,

              'late_payment_rate' =>
                  round($lateRate, 4),

              'average_days_late' =>
                  round($averageDaysLate, 2),
          ],

          'invoice_history' =>
              $invoiceHistory,
      ];
    }
}