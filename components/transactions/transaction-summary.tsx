"use client";

import { useMemo } from "react";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";

type TransactionSummaryProps = {
  transactions: DisplayTransaction[];
};

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const { income, expense, net } = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const txn of transactions) {
      if (txn.doType === 2) {
        totalIncome += txn.money;
      }

      if (txn.doType === 1) {
        totalExpense += txn.money;
      }
    }

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl px-3 py-2.5 before:absolute before:inset-0 before:opacity-[0.2] before:[background:var(--gradient-success)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/90 px-3 py-2.5 backdrop-blur-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-success">
          Income
        </span>
        <p className="mt-0.5 text-sm font-semibold text-success">
          {formatCurrencyByIso(income, "IDR")}
        </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl px-3 py-2.5 before:absolute before:inset-0 before:opacity-[0.2] before:[background:var(--gradient-danger)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/90 px-3 py-2.5 backdrop-blur-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">
          Expense
        </span>
        <p className="mt-0.5 text-sm font-semibold text-danger">
          {formatCurrencyByIso(expense, "IDR")}
        </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl px-3 py-2.5 before:absolute before:inset-0 before:opacity-[0.15] before:[background:var(--gradient-primary)] before:content-['']">
        <div className="relative z-10 rounded-2xl border border-white/10 bg-glass-bg/90 px-3 py-2.5 backdrop-blur-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/90">
          Net
        </span>
        <p
          className={`mt-0.5 text-sm font-semibold ${
            net >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {net >= 0 ? "+" : "-"}
          {formatCurrencyByIso(Math.abs(net), "IDR")}
        </p>
        </div>
      </div>
    </div>
  );
}
