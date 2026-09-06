export type Invoice = {
  id: number;
  invoice_number: string;
  amount: string;
  issue_date: string;
  due_date: string;
  status: string;

  days_overdue: number;
  priority_score: number;
  priority: "low" | "medium" | "high";
  recommended_action: {
    type: string;
    title: string;
    reason: string;
  } | null;
  customer: {
    id: number;
    name: string;
  };
  latest_ai_action: {
    id: number;
    type: string;
    status: "pending" | "approved" | "rejected";
    subject: string;
    message: string;
  } | null;
};

