<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\InvoicePriorityService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceExportController extends Controller
{
    public function export(
        Request $request,
        InvoicePriorityService $priorityService
    ): StreamedResponse {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::with('customer')
            ->whereHas('customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->orderBy('issue_date')
            ->get();

        $fileName = 'ralvia-invoices-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(
            function () use ($invoices, $priorityService) {
                $handle = fopen('php://output', 'w');

                // CSV column names
                fputcsv($handle, [
                    'invoice_id',
                    'invoice_number',
                    'customer_id',
                    'customer_name',
                    'amount',
                    'issue_date',
                    'due_date',
                    'status',
                    'days_overdue',
                    'priority',
                    'priority_score',
                ]);

                foreach ($invoices as $invoice) {
                    // Use Ralvia's existing business logic instead
                    // of calculating overdue information again.
                    $analysis = $priorityService->analyze($invoice);

                    fputcsv($handle, [
                        $invoice->id,
                        $invoice->invoice_number,
                        $invoice->customer->id,
                        $invoice->customer->name,
                        $invoice->amount,
                        $invoice->issue_date->format('Y-m-d'),
                        $invoice->due_date->format('Y-m-d'),
                        $analysis['status'],
                        $analysis['days_overdue'],
                        $analysis['priority'],
                        $analysis['priority_score'],
                    ]);
                }

                fclose($handle);
            },
            $fileName,
            [
                'Content-Type' => 'text/csv',
            ]
        );
    }
}