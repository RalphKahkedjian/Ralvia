<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AiService
{
    /**
     * Create a new class instance.
     */

    public function generateFollowUp(
        string $customerName,
        string $invoiceNumber,
        float $amount,
        int $daysOverdue
    ): array {
        $response = Http::timeout(10)->post(
            config('services.ai.url') . '/follow-ups/generate',
            [
                'customer_name' => $customerName,
                'invoice_number' => $invoiceNumber,
                'amount' => $amount,
                'days_overdue' => $daysOverdue
            ]
        );

        $response->throw();

        return $response->json();
    }

   public function explainAnalytics(
    array $aging,
    string $language
): array {
        $response = Http::timeout(10)->post(
            env('AI_SERVICE_URL') . '/analytics/explain',
            [
                'chart_type' => 'overdue_aging',
                'language' => $language,
                'aging' => $aging,
            ]
        );

        $response->throw();

        return $response->json();
    }

    public function askFinanceAgent(
        string $question,
        string $language,
        array $context,
        array $history
    ): array {
        $response = Http::timeout(15)->post(
            env('AI_SERVICE_URL') . '/chat',
            [
                'question' => $question,
                'language' => $language,
                'context' => $context,
                'history' => $history,
            ]
        );

        if (!$response->successful()) {
            dd($response->status(), $response->json());
        }

        return $response->json();
    }
    public function forecastInvoices(array $invoices, int $months = 3): array
    {
        $response = Http::timeout(60)->post(
            config('services.ai.url') . '/forecast',
            [
                'invoices' => $invoices,
                'months' => $months,
            ]
        );

        $response->throw();

        return $response->json();
    }

    public function buildRiskDataset(array $invoices): array
    {
        $response = Http::timeout(30)
            ->post(
                config('services.ai.url') . '/ml/risk/dataset',
                [
                    'invoices' => $invoices,
                ]
            );

        $response->throw();

        return $response->json();
    }

    public function trainRiskModel(array $invoices): array
    {
        $response = Http::timeout(30)
            ->post(
                config('services.ai.url') . '/ml/risk/train',
                [
                    'invoices' => $invoices,
                ]
            );

        $response->throw();

        return $response->json();
    }

    public function predictInvoiceRisk(array $features): array
    {
        $response = Http::timeout(30)
            ->post(
                config('services.ai.url') . '/ml/risk/predict',
                $features
            );

        $response->throw();

        return $response->json();
    }

    public function compareRiskModels(
    array $invoices
    ): array {
        $response = Http::timeout(60)
            ->post(
                config('services.ai.url')
                    . '/ml/risk/compare',
                [
                    'invoices' => $invoices,
                ]
            );

        $response->throw();

        return $response->json();
    }

    public function predictInvoiceRiskBatch(
        array $invoices
    ): array {
        $response = Http::timeout(30)
            ->post(
                config('services.ai.url')
                    . '/ml/risk/predict/batch',
                [
                    'invoices' => $invoices,
                ]
            );

        $response->throw();

        return $response->json();
    }

    public function explainInvoiceRisk(
    array $data
    ): array {
        $response = Http::timeout(30)
            ->post(
                config('services.ai.url')
                    . '/ml/risk/explain',
                $data
            );

        $response->throw();

        return $response->json();
    }
    public function __construct()
    {
        //
    }
}


