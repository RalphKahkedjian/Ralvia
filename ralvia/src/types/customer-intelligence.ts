export type PaymentOutcome =
  | "on_time"
  | "late"
  | "unpaid";

export type CustomerInvoiceHistory = {
  id: number;
  invoice_number: string;
  amount: number;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  payment_outcome: PaymentOutcome;
  days_late: number | null;
};

export type CustomerIntelligence = {
  customer: {
    id: number;
    name: string;
    email: string;
  };

  metrics: {
    total_invoiced: number;
    invoice_count: number;
    paid_invoice_count: number;
    late_invoice_count: number;
    late_payment_rate: number;
    average_days_late: number;
  };

  invoice_history: CustomerInvoiceHistory[];
};

export type CustomerIntelligenceResponse = {
  count: number;
  customers: CustomerIntelligence[];
};