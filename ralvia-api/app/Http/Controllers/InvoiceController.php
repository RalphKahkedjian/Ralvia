<?php

namespace App\Http\Controllers;

use App\Models\AiAction;
use App\Models\Invoice;
use App\Services\AiService;
use App\Services\InvoiceActionService;
use App\Services\InvoicePriorityService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    // Get invoices for the logged-in user's company
    public function index(
        Request $request,
        InvoicePriorityService $priorityService,
        InvoiceActionService $actionService
    ) {
        $companyId = $request->user()->company_id;

        $invoices = Invoice::with([
                'customer',
                'latestAiAction',
            ])
            ->whereHas('customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->get();

        return $invoices->map(function (Invoice $invoice) use (
            $priorityService,
            $actionService
        ) {
            $invoice = $priorityService->analyze($invoice);

            $invoice->recommended_action =
                $actionService->recommend($invoice);

            return $invoice;
        });
    }

    // Create invoice
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => [
                'required',
                Rule::exists('customers', 'id')->where(
                    fn ($query) =>
                        $query->where(
                            'company_id',
                            $request->user()->company_id
                        )
                ),
            ],

            'invoice_number' =>
                'required|string|unique:invoices,invoice_number',

            'amount' =>
                'required|numeric|min:0',

            'issue_date' =>
                'required|date',

            'due_date' =>
                'required|date|after_or_equal:issue_date',

            'status' =>
                'required|in:pending,paid,overdue',
        ]);

        $invoice = Invoice::create($validated);

        return response()->json(
            $invoice->load('customer'),
            201
        );
    }

    // Generate AI payment follow-up
    public function generateFollowUp(
        Request $request,
        Invoice $invoice,
        InvoicePriorityService $priorityService,
        AiService $aiService
    ) {
        // Load customer relation
        $invoice->load('customer');

        // Security:
        // make sure this invoice belongs to the logged-in user's company
        if (
            $invoice->customer->company_id
            !== $request->user()->company_id
        ) {
            abort(
                403,
                'You do not have access to this invoice.'
            );
        }

        // Recalculate invoice status / priority
        $invoice = $priorityService->analyze($invoice);

        // Only overdue invoices need follow-ups
        if ($invoice->status !== 'overdue') {
            return response()->json([
                'message' => 'This invoice is not overdue.',
            ], 422);
        }

        // Check if this invoice already has a pending follow-up
        $existingAction = AiAction::where(
                'invoice_id',
                $invoice->id
            )
            ->where(
                'type',
                'invoice_follow_up'
            )
            ->where(
                'status',
                'pending'
            )
            ->latest()
            ->first();

        // If a pending draft already exists,
        // return it instead of calling Gemini again
        if ($existingAction) {
            return response()->json(
                $existingAction
            );
        }

        // Ask FastAPI / Gemini to generate the follow-up
        $result = $aiService->generateFollowUp(
            $invoice->customer->name,
            $invoice->invoice_number,
            (float) $invoice->amount,
            $invoice->days_overdue
        );

        // Save AI-generated draft
        $action = AiAction::create([
            'invoice_id' =>
                $invoice->id,

            'type' =>
                'invoice_follow_up',

            'status' =>
                'pending',

            'subject' =>
                $result['subject'],

            'message' =>
                $result['message'],
        ]);

        return response()->json(
            $action,
            201
        );
    }
}