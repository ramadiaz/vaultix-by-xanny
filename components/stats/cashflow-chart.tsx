"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CashflowPoint, StatPeriod, formatCompactAmount } from "@/features/stats/utils/stats-utils";

type CashflowChartProps = {
  data: CashflowPoint[];
  period: StatPeriod;
};

type TooltipPayloadEntry = {
  name: string;
  value: number;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-glass-border bg-glass-bg-strong px-3 py-2 shadow-lg backdrop-blur-[var(--glass-blur)]">
      <p className="mb-1 text-[10px] font-medium text-muted">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-[11px]">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="capitalize text-muted-soft">{entry.name}</span>
          <span className="ml-auto font-semibold text-foreground">
            {formatCompactAmount(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function getXAxisInterval(period: StatPeriod, dataLength: number): number {
  if (period === "week") return 0;
  if (period === "month") return Math.floor(dataLength / 6);
  return 0;
}

export function CashflowChart({ data, period }: CashflowChartProps) {
  const interval = getXAxisInterval(period, data.length);
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="rounded-2xl border border-glass-border bg-glass-bg px-4 py-4">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
        Cashflow
      </h3>

      {!hasData ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <p className="text-[13px] text-muted-soft">No transactions in this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barGap={2} barCategoryGap="30%">
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 11, fill: "rgba(148,163,184,0.75)" }}
              axisLine={false}
              tickLine={false}
              interval={interval}
            />
            <YAxis
              tickFormatter={formatCompactAmount}
              tick={{ fontSize: 11, fill: "rgba(148,163,184,0.75)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="income" name="income" fill="var(--success)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expense" name="expense" fill="var(--danger)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-success" />
          <span className="text-[12px] text-muted-soft">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-danger" />
          <span className="text-[12px] text-muted-soft">Expense</span>
        </div>
      </div>
    </div>
  );
}
