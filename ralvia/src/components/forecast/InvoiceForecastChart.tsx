"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

import type { InvoiceForecast } from "@/types/forecast";

type Props = {
  data: InvoiceForecast;
};

export default function InvoiceForecastChart({ data }: Props) {
  const history = data.history.map((item) => ({
    date: item.ds.slice(0, 7),
    actual: item.y,
    forecast: null,
    lower: null,
    upper: null,
  }));

  const forecast = data.forecast.map((item) => ({
    date: item.ds.slice(0, 7),
    actual: null,
    forecast: item.yhat,
    lower: item.yhat_lower,
    upper: item.yhat_upper,
  }));

  const chartData = [...history, ...forecast];

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Invoice Volume Forecast
        </h2>

        <p className="text-sm text-gray-500">
          Historical invoice volume with a 3-month Prophet forecast.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip
            formatter={(value, name) => {
              if (typeof value !== "number") {
                return [value, name];
              }

              return [
                `$${value.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`,
                name,
              ];
            }}
          />

          <Area
            type="monotone"
            dataKey="upper"
            fillOpacity={0.12}
            stroke="none"
            name="Upper estimate"
          />

          <Area
            type="monotone"
            dataKey="lower"
            fillOpacity={0.12}
            stroke="none"
            name="Lower estimate"
          />

          <Line
            type="monotone"
            dataKey="actual"
            strokeWidth={2}
            dot={false}
            name="Actual"
          />

          <Line
            type="monotone"
            dataKey="forecast"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}