<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\Invoice;
use App\Models\Customer;
use App\Services\AiService;
use App\Services\InvoicePriorityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;


class FinanceChatController extends Controller
{
    public function ask(
        Request $request,
        InvoicePriorityService $priorityService,
        AiService $aiService
    ) {
        // 1. Validate what came from the frontend
        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'language' => 'required|in:en,ar',
            'conversation_id' => 'nullable|integer',
        ]);

        $companyId = $request->user()->company_id;

        // 2. Get existing conversation OR create a new one
        if (!empty($validated['conversation_id'])) {
            $conversation = ChatConversation::where(
                'company_id',
                $companyId
            )
                ->where('id', $validated['conversation_id'])
                ->firstOrFail();
        } else {
            $conversation = ChatConversation::create([
                'company_id' => $companyId,
                'title' => mb_substr($validated['question'], 0, 60),
            ]);
        }

        // 3. Load PREVIOUS messages before saving the new question
        $history = $conversation->messages()
            ->latest()
            ->take(20)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($message) {
                return [
                    'role' => $message->role,
                    'content' => $message->content,
                ];
            })
            ->toArray();

        // 4. Save the user's new message
        $conversation->messages()->create([
            'role' => 'user',
            'content' => $validated['question'],
            'language' => $validated['language'],
        ]);

        // 5. Get ONLY this company's invoices
        $invoices = Invoice::with('customer')
            ->whereHas('customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->get();

        $invoiceData = [];

        foreach ($invoices as $invoice) {
            $invoice = $priorityService->analyze($invoice);

            $invoiceData[] = [
                'invoice_number' => $invoice->invoice_number,
                'customer' => $invoice->customer->name,
                'amount' => (float) $invoice->amount,
                'status' => $invoice->status,
                'days_overdue' => $invoice->days_overdue,
                'priority' => $invoice->priority,
            ];
        }

// 6. Get ALL customers for this company
$customers = Customer::where(
    'company_id',
    $companyId
)
    ->get([
        'id',
        'name',
        'email',
        'phone',
    ]);

$customerData = $customers
    ->map(function ($customer) {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ];
    })
    ->toArray();

// 7. Build the full company context
$context = [
    'customers' => $customerData,
    'invoices' => $invoiceData,
];

        // 6. Ask Ralvia
        $result = $aiService->askFinanceAgent(
            $validated['question'],
            $validated['language'],
            $context,
            $history
        );

        // 7. Save Ralvia's answer
       $assistantMessage = $conversation->messages()->create([
    'role' => 'assistant',
    'content' => $result['answer'],
    'language' => $validated['language'],
]);

return response()->json([
    'conversation_id' => $conversation->id,
    'message' => $assistantMessage,
    'action' => $result['action'] ?? null,
]);
    }

    public function conversations(Request $request)
    {
        $companyId = $request->user()->company_id;

        $conversations = ChatConversation::where('company_id', $companyId)
            ->latest('updated_at')
            ->get([
                'id',
                'title',
                'created_at',
                'updated_at',
            ]);

        return response()->json($conversations);
    }

    public function show(
    Request $request,
    ChatConversation $conversation
    ) {
        if ($conversation->company_id !== $request->user()->company_id) {
            abort(404);
        }

        $conversation->load([
            'messages' => function ($query) {
                $query->oldest();
            }
        ]);

        return response()->json([
            'id' => $conversation->id,
            'title' => $conversation->title,
            'messages' => $conversation->messages,
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ]);
    }

    public function confirmCustomerAction(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $companyId = $request->user()->company_id;

        $existingCustomer = \App\Models\Customer::where(
            'company_id',
            $companyId
        )
            ->where('name', $validated['name'])
            ->first();

        if ($existingCustomer) {
            return response()->json([
                'message' => 'A customer with this name already exists.',
            ], 409);
        }

        $customer = \App\Models\Customer::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Customer created successfully.',
            'customer' => $customer,
        ], 201);
    }

    public function confirmInvoiceAction(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'invoice_number' => 'required|string|max:255',
        'amount' => 'required|numeric|min:0.01',
        'issue_date' => 'required|date',
        'due_date' => 'required|date|after_or_equal:issue_date',
    ]);

    $companyId = $request->user()->company_id;

    // Find the customer ONLY inside the logged-in company.
    $customer = Customer::where('company_id', $companyId)
        ->where('name', $validated['customer_name'])
        ->first();

    if (!$customer) {
        return response()->json([
            'message' => 'Customer could not be found in your company.',
        ], 404);
    }

    // Prevent duplicate invoice numbers inside this company.
    $invoiceExists = Invoice::whereHas('customer', function ($query) use ($companyId) {
        $query->where('company_id', $companyId);
    })
        ->where('invoice_number', $validated['invoice_number'])
        ->exists();

    if ($invoiceExists) {
        return response()->json([
            'message' => 'An invoice with this invoice number already exists.',
        ], 409);
    }

    $invoice = Invoice::create([
        'customer_id' => $customer->id,
        'invoice_number' => $validated['invoice_number'],
        'amount' => $validated['amount'],
        'issue_date' => $validated['issue_date'],
        'due_date' => $validated['due_date'],
        'status' => 'pending',
    ]);

    return response()->json([
        'message' => 'Invoice created successfully.',
        'invoice' => $invoice,
    ], 201);
}

public function confirmEmailAction(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'subject' => 'required|string|max:255',
        'message' => 'required|string|max:5000',
    ]);

    $companyId = $request->user()->company_id;

    $customer = Customer::where('company_id', $companyId)
        ->where('name', $validated['customer_name'])
        ->first();

    if (!$customer) {
        return response()->json([
            'message' => 'Customer could not be found in your company.',
        ], 404);
    }

    if (!$customer->email) {
        return response()->json([
            'message' => 'This customer does not have an email address.',
        ], 422);
    }

    Mail::raw(
        $validated['message'],
        function ($mail) use ($customer, $validated) {
            $mail->to($customer->email)
                ->subject($validated['subject']);
        }
    );

    return response()->json([
        'message' => 'Email sent successfully.',
        'customer' => [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
        ],
    ]);
}
}