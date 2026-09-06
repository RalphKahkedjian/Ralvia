<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\AiService;
use Illuminate\Http\Request;

class ForecastController extends Controller
{
    public function index(
        Request $request,
        AiService $aiService
    ) {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::whereHas(
            'customer',
            function ($query) use ($companyId) {
                $query->where(
                    'company_id',
                    $companyId
                );
            }
        )
        ->orderBy('issue_date')
        ->get([
            'issue_date',
            'amount',
            'customer_id',
        ]);

        if ($invoices->isEmpty()) {
            return response()->json([
                'message' => 'No invoice history available.',
            ], 422);
        }

        $invoiceData = $invoices
            ->map(function ($invoice) {
                return [
                    'issue_date' =>
                        $invoice->issue_date->format('Y-m-d'),

                    'amount' =>
                        (float) $invoice->amount,
                ];
            })
            ->values()
            ->toArray();

        $forecast = $aiService->forecastInvoices(
            $invoiceData,
            3
        );

        return response()->json($forecast);
    }
}