"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    month: string;
    amount: number;
  }[];
};

export default function InvoiceTrendChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Invoice Volume
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Total value of invoices issued each month.
        </p>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `$${Number(value).toLocaleString()}`
              }
            />

            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Invoice Volume",
              ]}
            />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#111827"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}