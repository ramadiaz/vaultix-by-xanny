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
      <div className="rounded-2xl border border-glass-border bg-glass-bg px-3 py-2.5 ring-1 ring-success/10">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-success/70">
          Income
        </span>
        <p className="mt-0.5 text-sm font-semibold text-success">
          {formatCurrencyByIso(income, "IDR")}
        </p>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass-bg px-3 py-2.5 ring-1 ring-danger/10">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-danger/70">
          Expense
        </span>
        <p className="mt-0.5 text-sm font-semibold text-danger">
          {formatCurrencyByIso(expense, "IDR")}
        </p>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass-bg px-3 py-2.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-soft">
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
  );
}
