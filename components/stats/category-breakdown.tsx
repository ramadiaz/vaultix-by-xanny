"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryBreakdownItem, formatCompactAmount } from "@/features/stats/utils/stats-utils";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";

type CategoryBreakdownProps = {
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: CategoryBreakdownItem }[];
};

function DonutTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-white/10 bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-[11px] font-medium text-foreground">
        {item.icon} {item.name}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-soft">
        {formatCurrencyByIso(item.amount, "IDR")} · {item.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: CategoryBreakdownItem[];
  total: number;
}) {
  return (
    <div className="relative mx-auto w-fit">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            dataKey="amount"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-muted-soft">Total</span>
        <span className="text-[15px] font-bold text-foreground">
          {formatCompactAmount(total)}
        </span>
      </div>
    </div>
  );
}

function CategoryList({ items }: { items: CategoryBreakdownItem[] }) {
  const visible = items.slice(0, 6);

  return (
    <div className="mt-4 space-y-3">
      {visible.map((item, index) => (
        <div
          key={item.ctgUid ?? "uncategorized"}
          className="flex min-h-[44px] items-center gap-3"
        >
          <span className="w-4 shrink-0 text-center text-[11px] font-medium text-muted-soft">
            {index + 1}
          </span>
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-base"
            style={{ background: `${item.color}22` }}
          >
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium text-foreground">
                {item.name}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-foreground tabular-nums">
                {formatCompactAmount(item.amount)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    background: item.color,
                  }}
                />
              </div>
              <span className="shrink-0 text-[11px] text-muted-soft tabular-nums">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryBreakdown({
  expenseBreakdown,
  incomeBreakdown,
}: CategoryBreakdownProps) {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  const data = activeTab === "expense" ? expenseBreakdown : incomeBreakdown;
  const total = data.reduce((s, i) => s + i.amount, 0);
  const isEmpty = data.length === 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-accent-soft/40 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
          By Category
        </h3>
        <div className="flex gap-1 rounded-xl border border-border-subtle bg-background p-1">
          <button
            onClick={() => setActiveTab("expense")}
            className={`min-h-[36px] rounded-lg px-3 py-2 text-[12px] font-semibold transition-all active:scale-[0.98] ${
              activeTab === "expense"
                ? "bg-danger/10 text-danger"
                : "text-muted active:text-foreground"
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`min-h-[36px] rounded-lg px-3 py-2 text-[12px] font-semibold transition-all active:scale-[0.98] ${
              activeTab === "income"
                ? "bg-success/10 text-success"
                : "text-muted active:text-foreground"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <p className="text-[13px] text-muted-soft">
            No {activeTab} data in this period
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <DonutChart data={data} total={total} />
          <CategoryList items={data} />
        </div>
      )}
    </div>
  );
}
