export type AnalyticsOverview = {
  summary: {
    total_receivable: number;
    total_overdue: number;
    paid_amount: number;
    pending_amount: number;
  };

  aging: {
    label: string;
    amount: number;
  }[];
  monthly: {
    month: string;
    amount: number;
  }[];
};