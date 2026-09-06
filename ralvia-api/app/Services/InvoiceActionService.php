<?php

namespace App\Services;

use App\Models\Invoice;

class InvoiceActionService
{
    public function recommend(Invoice $invoice): ?array
    {
        if ($invoice->status !== 'overdue') {
            return null;
        }

        if ($invoice->priority === 'high') {
            return [
                'type' => 'follow_up',
                'title' => 'Follow up today',
                'reason' => "This invoice is {$invoice->days_overdue} days overdue and has high priority.",
            ];
        }

        if ($invoice->priority === 'medium') {
            return [
                'type' => 'follow_up',
                'title' => 'Follow up soon',
                'reason' => "This invoice is {$invoice->days_overdue} days overdue.",
            ];
        }

        return [
            'type' => 'monitor',
            'title' => 'Monitor invoice',
            'reason' => 'This invoice is overdue but currently has low priority.',
        ];
    }
}