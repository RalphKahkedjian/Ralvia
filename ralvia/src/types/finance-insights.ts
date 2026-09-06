export type FinanceOverview = {
  total_customers: number;
  total_invoices: number;
  outstanding_receivables: number;
  unpaid_invoice_count: number;
  customers_needing_attention: number;
  high_risk_invoice_count: number;
  high_risk_receivables: number;
};

export type HighRiskReceivable = {
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  amount: number;
  due_date: string;
  late_probability: number;
  risk: string;
};

export type CustomerWarning = {
  customer_id: number;
  customer_name: string;
  paid_invoice_count: number;
  late_invoice_count: number;
  late_payment_rate: number;
  average_days_late: number;
};

export type ForecastHistoryPoint = {
  ds: string;
  y: number;
};

export type ForecastPoint = {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
};

export type FinanceInsightsResponse = {
  overview: FinanceOverview;

  high_risk_receivables: HighRiskReceivable[];

  customer_warnings: CustomerWarning[];

  forecast: {
    history: ForecastHistoryPoint[];
    forecast: ForecastPoint[];
  } | null;
};