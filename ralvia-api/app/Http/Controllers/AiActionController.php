<?php

namespace App\Http\Controllers;

use App\Models\AiAction;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;

class AiActionController extends Controller
{

    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        $actions = AiAction::with([
                'invoice.customer',
            ])
            ->whereHas('invoice.customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->latest()
            ->get();

        return response()->json($actions);
    }
    public function approve(Request $request, AiAction $aiAction)
    {
        $aiAction->load('invoice.customer');

        if (
            $aiAction->invoice->customer->company_id
            !== $request->user()->company_id
        ) {
            abort(403, 'You do not have access to this action.');
        }

        if ($aiAction->status !== 'pending') {
            return response()->json([
                'message' => 'This action has already been reviewed.',
            ], 422);
        }

        $aiAction->update([
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Follow-up approved successfully.',
            'action' => $aiAction,
        ]);
    }
    public function update(Request $request, AiAction $aiAction)
    {
        $aiAction->load('invoice.customer');

        // Tenant security
        if (
            $aiAction->invoice->customer->company_id
            !== $request->user()->company_id
        ) {
            abort(403, 'You do not have access to this action.');
        }

        // Approved/rejected actions should no longer be editable
        if ($aiAction->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending actions can be edited.',
            ], 422);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $aiAction->update($validated);

        return response()->json([
            'message' => 'Draft updated successfully.',
            'action' => $aiAction,
        ]);
    }

    public function reject(Request $request, AiAction $aiAction)
    {
        $aiAction->load('invoice.customer');

        if (
            $aiAction->invoice->customer->company_id
            !== $request->user()->company_id
        ) {
            abort(403, 'You do not have access to this action.');
        }

        if ($aiAction->status !== 'pending') {
            return response()->json([
                'message' => 'This action has already been reviewed.',
            ], 422);
        }

        $aiAction->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Follow-up rejected successfully.',
            'action' => $aiAction,
        ]);
    }

    public function send(Request $request, AiAction $aiAction)
    {
        $aiAction->load('invoice.customer');

        if (
            $aiAction->invoice->customer->company_id
            !== $request->user()->company_id
        ) {
            abort(403, 'You do not have access to this action.');
        }

        if ($aiAction->status !== 'approved') {
            return response()->json([
                'message' => 'This action must be approved before sending.',
            ], 422);
        }

        if ($aiAction->sent_at !== null) {
            return response()->json([
                'message' => 'This email has already been sent.',
            ], 422);
        }

        $customer = $aiAction->invoice->customer;

        if (!$customer->email) {
            return response()->json([
                'message' => 'This customer does not have an email address.',
            ], 422);
        }

        Mail::raw($aiAction->message, function ($mail) use ($customer, $aiAction) {
            $mail->to($customer->email)
                ->subject($aiAction->subject);
        });

        $aiAction->update([
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Email sent successfully.',
            'action' => $aiAction,
        ]);
    }
}