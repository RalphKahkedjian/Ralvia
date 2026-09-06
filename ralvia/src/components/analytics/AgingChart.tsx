"use client";
import ExplainWithRalvia from "./ExplainWithRalvia";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AgingData = {
  label: string;
  amount: number;
};

type Props = {
  data: AgingData[];
};

export default function AgingChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Overdue Aging
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Outstanding invoices grouped by days overdue.
        </p>
      </div>

      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
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
                "Outstanding",
              ]}
            />

            <Bar
              dataKey="amount"
              fill="#111827"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ExplainWithRalvia />
    </div>
  );
}