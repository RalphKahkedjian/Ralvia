"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  paid: number;
  pending: number;
  overdue: number;
};

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function InvoiceStatusChart({
  paid,
  pending,
  overdue,
}: Props) {
  const data = [
    {
      name: "Paid",
      amount: paid,
    },
    {
      name: "Pending",
      amount: pending,
    },
    {
      name: "Overdue",
      amount: overdue,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Invoice Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Distribution of invoice amounts by payment status.
        </p>
      </div>

      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                `$${Number(value).toLocaleString()}`
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}