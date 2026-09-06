<?php

namespace App\Services;

use App\Models\AiAction;
use App\Models\Alert;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class FinanceAgentService
{
    public function __construct(
        private InvoicePriorityService $priorityService,
        private InvoiceActionService $actionService,
        private AiService $aiService
    ) {
    }

    public function run(User $user): array
    {
        $companyId = $user->company_id;

        $invoices = Invoice::with('customer')
            ->whereHas('customer', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->get();

        $createdActions = [];
        $createdAlerts = [];

        foreach ($invoices as $invoice) {

            /*
            |--------------------------------------------------------------------------
            | 1. Analyze invoice
            |--------------------------------------------------------------------------
            |
            | This calculates things such as:
            | - overdue status
            | - days overdue
            | - priority score
            |
            */

            $invoice = $this->priorityService->analyze($invoice);

            /*
            |--------------------------------------------------------------------------
            | 2. Detect dangerous invoice
            |--------------------------------------------------------------------------
            |
            | For now:
            |
            | - invoice must be overdue
            | - 30+ days overdue
            | - amount >= $5,000
            |
            */

            if (
                $invoice->status === 'overdue' &&
                $invoice->days_overdue >= 30 &&
                (float) $invoice->amount >= 5000
            ) {
                /*
                |--------------------------------------------------------------------------
                | Prevent duplicate unread alerts
                |--------------------------------------------------------------------------
                */

                $existingAlert = Alert::where('invoice_id', $invoice->id)
                    ->where('type', 'overdue_risk')
                    ->where('status', 'unread')
                    ->exists();

                if (!$existingAlert) {

                    /*
                    |--------------------------------------------------------------------------
                    | Create alert
                    |--------------------------------------------------------------------------
                    */

                    $alert = Alert::create([
                        'company_id' => $companyId,
                        'invoice_id' => $invoice->id,
                        'type' => 'overdue_risk',
                        'severity' => 'high',
                        'title' => 'High-risk overdue invoice',
                        'message' =>
                            "Invoice {$invoice->invoice_number} for $" .
                            number_format((float) $invoice->amount, 2) .
                            " is {$invoice->days_overdue} days overdue.",
                        'status' => 'unread',
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Notify business owner
                    |--------------------------------------------------------------------------
                    |
                    | With MAIL_MAILER=log this goes to laravel.log.
                    | Later we can replace it with real email delivery.
                    |
                    */

                    Mail::raw(
                        $alert->message,
                        function ($mail) use ($user, $alert) {
                            $mail->to($user->email)
                                ->subject(
                                    "Ralvia Alert: {$alert->title}"
                                );
                        }
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Mark alert as notified
                    |--------------------------------------------------------------------------
                    */

                    $alert->update([
                        'notified_at' => now(),
                    ]);

                    $createdAlerts[] = $alert;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | 3. Ignore invoices that don't require collection action
            |--------------------------------------------------------------------------
            */

            if ($invoice->status !== 'overdue') {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | 4. Determine recommended action
            |--------------------------------------------------------------------------
            */

            $recommendation = $this->actionService->recommend($invoice);

            if (!$recommendation) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | 5. Prevent duplicate pending AI follow-ups
            |--------------------------------------------------------------------------
            */

            $existingAction = AiAction::where('invoice_id', $invoice->id)
                ->where('type', 'invoice_follow_up')
                ->where('status', 'pending')
                ->exists();

            if ($existingAction) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | 6. Ask Gemini to create the email draft
            |--------------------------------------------------------------------------
            */

            $draft = $this->aiService->generateFollowUp(
                $invoice->customer->name,
                $invoice->invoice_number,
                (float) $invoice->amount,
                $invoice->days_overdue
            );

            /*
            |--------------------------------------------------------------------------
            | 7. Save generated AI action
            |--------------------------------------------------------------------------
            */

            $action = AiAction::create([
                'invoice_id' => $invoice->id,
                'type' => 'invoice_follow_up',
                'status' => 'pending',
                'subject' => $draft['subject'],
                'message' => $draft['message'],
            ]);

            $createdActions[] = $action;
        }

        /*
        |--------------------------------------------------------------------------
        | Agent scan result
        |--------------------------------------------------------------------------
        */

        return [
            'invoices_scanned' => $invoices->count(),

            'actions_created' => count($createdActions),
            'actions' => $createdActions,

            'alerts_created' => count($createdAlerts),
            'alerts' => $createdAlerts,
        ];
    }
}