export type AiAction = {
  id: number;
  type: string;
  status: "pending" | "approved" | "rejected";
  subject: string;
  message: string;
  sent_at: string | null,

  invoice: {
    id: number;
    invoice_number: string;

    customer: {
      id: number;
      name: string;
    };
  };
};