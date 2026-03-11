"use client";

import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type StatsSummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
};

export function StatsSummaryCards({
  totalIncome,
  totalExpense,
  net,
  transactionCount,
}: StatsSummaryCardsProps) {
  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative min-h-[88px] overflow-hidden rounded-2xl px-4 py-4 before:absolute before:inset-0 before:opacity-[0.15] before:[background:var(--gradient-success)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 shrink-0 text-success" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-success/80">
            Income
          </span>
        </div>
        <p className="mt-2 overflow-hidden text-ellipsis text-[15px] font-bold leading-tight text-success tabular-nums">
          {formatCurrencyByIso(totalIncome, "IDR")}
        </p>
        </div>
      </div>

      <div className="relative min-h-[88px] overflow-hidden rounded-2xl px-4 py-4 before:absolute before:inset-0 before:opacity-[0.15] before:[background:var(--gradient-danger)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TrendingDown className="size-4 shrink-0 text-danger/80" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-danger/80">
            Expense
          </span>
        </div>
        <p className="mt-2 overflow-hidden text-ellipsis text-[15px] font-bold leading-tight text-danger tabular-nums">
          {formatCurrencyByIso(totalExpense, "IDR")}
        </p>
        </div>
      </div>

      <div className="relative min-h-[88px] overflow-hidden rounded-2xl px-4 py-4 before:absolute before:inset-0 before:opacity-[0.12] before:[background:var(--gradient-primary)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Minus className="size-4 shrink-0 text-muted-soft" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
            Net
          </span>
        </div>
        <p
          className={`mt-2 overflow-hidden text-ellipsis text-[15px] font-bold leading-tight tabular-nums ${
            net >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {net >= 0 ? "+" : ""}
          {formatCurrencyByIso(net, "IDR")}
        </p>
        </div>
      </div>

      <div className="relative min-h-[88px] overflow-hidden rounded-2xl px-4 py-4 before:absolute before:inset-0 before:opacity-[0.12] before:[background:var(--gradient-warm)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/80 px-4 py-4 backdrop-blur-sm">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-soft">
          Savings
        </span>
        <p className="mt-2 text-[15px] font-bold leading-tight text-foreground tabular-nums">
          {savingsRate !== null ? `${savingsRate}%` : "—"}
        </p>
        <p className="mt-1 text-[11px] text-muted-soft">
          {transactionCount} txns
        </p>
        </div>
      </div>
    </div>
  );
}
