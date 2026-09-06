"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ForecastHistoryPoint,
  ForecastPoint,
} from "@/types/finance-insights";

type Props = {
  history: ForecastHistoryPoint[];
  forecast: ForecastPoint[];
};

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FinanceForecastChart({
  history,
  forecast,
}: Props) {
  const historyData = history.map((point) => ({
    date: point.ds,
    actual: point.y,
    forecast: null as number | null,
  }));

  const lastHistory =
    history[history.length - 1];

  const forecastData = forecast.map(
    (point) => ({
      date: point.ds,
      actual: null as number | null,
      forecast: point.yhat,
    })
  );

  /*
   * Add the final historical point to the
   * forecast line so both lines visually connect.
   */
  if (lastHistory) {
    forecastData.unshift({
      date: lastHistory.ds,
      actual: null,
      forecast: lastHistory.y,
    });
  }

  const chartData = [
    ...historyData,
    ...forecastData,
  ];

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatMonth}
            tick={{
              fontSize: 12,
            }}
            minTickGap={35}
          />

          <YAxis
            tickFormatter={(value) =>
              `$${Math.round(
                value / 1000
              )}k`
            }
            tick={{
              fontSize: 12,
            }}
          />

          <Tooltip
            labelFormatter={(value) =>
              formatMonth(String(value))
            }
            formatter={(
              value,
              name
            ) => [
              formatCurrency(
                Number(value)
              ),
              name === "actual"
                ? "Actual"
                : "Forecast",
            ]}
          />

          <Line
            type="monotone"
            dataKey="actual"
            name="actual"
            stroke="#14213D"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />

          <Line
            type="monotone"
            dataKey="forecast"
            name="forecast"
            stroke="#5B6CFF"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            dot={{
              r: 3,
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}