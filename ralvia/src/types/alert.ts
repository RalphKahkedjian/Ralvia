export type Alert = {
  id: number;
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  status: "unread" | "read";
  notified_at: string | null;

  invoice: {
    id: number;
    invoice_number: string;

    customer: {
      id: number;
      name: string;
    };
  } | null;
};