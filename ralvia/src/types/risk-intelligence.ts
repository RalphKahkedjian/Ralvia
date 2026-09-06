export type RiskLevel =
  | "low"
  | "medium"
  | "high";


export type RiskIntelligenceResponse = {
  count: number;
  invoices: RiskInvoice[];
};

export type RiskFeatures = {
  amount: number;
  payment_terms_days: number;
  issue_month: number;
  previous_invoice_count: number;
  previous_late_rate: number;
  previous_avg_days_late: number;
  amount_vs_customer_average: number;
};

export type RiskInvoice = {
  id: number;
  invoice_number: string;

  customer: {
    id: number;
    name: string;
  };

  amount: number;
  issue_date: string;
  due_date: string;

  late_probability: number;
  risk: RiskLevel;

  features: RiskFeatures;
};