<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\AiService;
use App\Services\InvoiceRiskFeatureService;
use Illuminate\Http\Request;

class MlTrainingController extends Controller
{
    public function invoices(Request $request)
    {
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
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->orderBy('issue_date')
            ->get();

        $data = $invoices->map(
            function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'customer_id' => $invoice->customer_id,
                    'amount' => (float) $invoice->amount,
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'paid_at' => $invoice->paid_at->format('Y-m-d'),
                ];
            }
        );

        return response()->json([
            'count' => $data->count(),
            'invoices' => $data->values(),
        ]);
    }

    public function dataset(
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
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->orderBy('issue_date')
            ->get();

        $data = $invoices->map(
            function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'customer_id' => $invoice->customer_id,
                    'amount' => (float) $invoice->amount,
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'paid_at' => $invoice->paid_at->format('Y-m-d'),
                ];
            }
        )->values()->toArray();

        $result = $aiService->buildRiskDataset(
            $data
        );

        return response()->json(
            $result
        );
    }

    public function train(
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
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->orderBy('issue_date')
            ->get();

        $data = $invoices->map(
            function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'customer_id' => $invoice->customer_id,
                    'amount' => (float) $invoice->amount,
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'paid_at' => $invoice->paid_at->format('Y-m-d'),
                ];
            }
        )->values()->toArray();

        $result = $aiService->trainRiskModel(
            $data
        );

        return response()->json($result);
    }

    public function predict(
    Request $request,
    Invoice $invoice,
    AiService $aiService,
    InvoiceRiskFeatureService $featureService
    ) {
        $companyId = $request->user()->company_id;

        $belongsToCompany =
            $invoice->customer()
                ->where(
                    'company_id',
                    $companyId
                )
                ->exists();

        abort_unless(
            $belongsToCompany,
            404
        );

        $features = $featureService->build(
            $invoice
        );

        $prediction =
            $aiService->predictInvoiceRisk(
                $features
            );

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' =>
                    $invoice->invoice_number,
                'amount' =>
                    (float) $invoice->amount,
            ],

            'features' => $features,

            'prediction' => $prediction,
        ]);
    }

    public function compare(
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
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->orderBy('issue_date')
            ->get();

        $data = $invoices->map(
            function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'customer_id' => $invoice->customer_id,
                    'amount' => (float) $invoice->amount,
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'paid_at' => $invoice->paid_at->format('Y-m-d'),
                ];
            }
        )->values()->toArray();

        $result = $aiService->compareRiskModels(
            $data
        );

        return response()->json(
            $result
        );
    }

    public function intelligence(
    Request $request,
    AiService $aiService,
    InvoiceRiskFeatureService $featureService
    ) {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::with('customer')
            ->whereHas(
                'customer',
                function ($query) use ($companyId) {
                    $query->where(
                        'company_id',
                        $companyId
                    );
                }
            )
            ->where('status', '!=', 'paid')
            ->orderByDesc('issue_date')
            ->get();

        $batch = [];
        $featuresByInvoice = [];

        foreach ($invoices as $invoice) {
            $features = $featureService->build(
                $invoice
            );

            $featuresByInvoice[$invoice->id] = $features;

            $batch[] = [
                'invoice_id' =>
                    $invoice->id,

                ...$features,
            ];
        }

        $predictionResult =
            $aiService->predictInvoiceRiskBatch(
                $batch
            );

        $predictionsByInvoice =
            collect(
                $predictionResult['predictions']
            )->keyBy('invoice_id');

        $results = $invoices->map(
            function ($invoice) use (
                $predictionsByInvoice,
                $featuresByInvoice
            ) {
                $prediction =
                    $predictionsByInvoice->get(
                        $invoice->id
                    );

                return [
                    'id' => $invoice->id,

                    'invoice_number' =>
                        $invoice->invoice_number,

                    'customer' => [
                        'id' =>
                            $invoice->customer->id,

                        'name' =>
                            $invoice->customer->name,
                    ],

                    'amount' =>
                        (float) $invoice->amount,

                    'issue_date' =>
                        $invoice->issue_date
                            ->format('Y-m-d'),

                    'due_date' =>
                        $invoice->due_date
                            ->format('Y-m-d'),

                    'late_probability' =>
                        $prediction[
                            'late_probability'
                        ] ?? null,

                    'risk' =>
                        $prediction[
                            'risk'
                        ] ?? null,

                    'features' =>
                        $featuresByInvoice[
                            $invoice->id
                        ],
                ];
            }
        );

        return response()->json([
            'count' => $results->count(),
            'invoices' => $results->values(),
        ]);
    }

    public function explain(
    Request $request,
    Invoice $invoice,
    AiService $aiService,
    InvoiceRiskFeatureService $featureService
    ) {
        $companyId =
            $request->user()->company_id;

        $invoice->load('customer');

        if (
            $invoice->customer->company_id
            !== $companyId
        ) {
            abort(403);
        }

        $features =
            $featureService->build($invoice);

        $prediction =
            $aiService->predictInvoiceRisk(
                $features
            );

        $explanation =
            $aiService->explainInvoiceRisk([
                'invoice_number' =>
                    $invoice->invoice_number,

                'customer_name' =>
                    $invoice->customer->name,

                'amount' =>
                    (float) $invoice->amount,

                'due_date' =>
                    $invoice->due_date
                        ->format('Y-m-d'),

                'late_probability' =>
                    $prediction[
                        'late_probability'
                    ],

                'risk' =>
                    $prediction['risk'],

                'payment_terms_days' =>
                    $features[
                        'payment_terms_days'
                    ],

                'previous_invoice_count' =>
                    $features[
                        'previous_invoice_count'
                    ],

                'previous_late_rate' =>
                    $features[
                        'previous_late_rate'
                    ],

                'previous_avg_days_late' =>
                    $features[
                        'previous_avg_days_late'
                    ],

                'amount_vs_customer_average' =>
                    $features[
                        'amount_vs_customer_average'
                    ],
            ]);

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' =>
                    $invoice->invoice_number,
            ],

            'prediction' => $prediction,

            'explanation' => $explanation,
        ]);
    }
}