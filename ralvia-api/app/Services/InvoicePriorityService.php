<?php

namespace App\Services;

use App\Models\Invoice;
use Carbon\Carbon;

class InvoicePriorityService
{
    public function analyze(Invoice $invoice): Invoice
    {
        $invoice->days_overdue = 0;
        $invoice->priority_score = 0;
        $invoice->priority = 'low';

        if (
            $invoice->status !== 'paid' &&
            Carbon::parse($invoice->due_date)->isPast()
        ) {
            $invoice->status = 'overdue';

            $invoice->days_overdue = Carbon::parse($invoice->due_date)
                ->startOfDay()
                ->diffInDays(now()->startOfDay());

            $invoice->priority_score += $invoice->days_overdue * 2;

            if ($invoice->amount >= 5000) {
                $invoice->priority_score += 30;
            } elseif ($invoice->amount >= 2000) {
                $invoice->priority_score += 20;
            } elseif ($invoice->amount >= 500) {
                $invoice->priority_score += 10;
            }

            if ($invoice->priority_score >= 50) {
                $invoice->priority = 'high';
            } elseif ($invoice->priority_score >= 20) {
                $invoice->priority = 'medium';
            }
        }

        return $invoice;
    }
}