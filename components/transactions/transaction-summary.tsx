"use client";

import { useMemo } from "react";
import { Transaction } from "@/features/transactions/types/transaction";
import { formatCurrency } from "@/features/wallets/utils/format-currency";

type TransactionSummaryProps = {
  transactions: Transaction[];
};

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const { income, expense, net } = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const txn of transactions) {
      if (txn.kind === "income") {
        totalIncome += txn.amount;
      }

      if (txn.kind === "expense") {
        totalExpense += txn.amount;
      }
    }

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-2xl border border-border-subtle bg-success/5 px-3 py-2.5 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-success/70">
          Income
        </span>
        <p className="mt-0.5 text-sm font-semibold text-success">
          {formatCurrency(income, "IDR")}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-danger/5 px-3 py-2.5 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-danger/70">
          Expense
        </span>
        <p className="mt-0.5 text-sm font-semibold text-danger">
          {formatCurrency(expense, "IDR")}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-accent-soft/60 px-3 py-2.5 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-soft">
          Net
        </span>
        <p
          className={`mt-0.5 text-sm font-semibold ${
            net >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {net >= 0 ? "+" : "-"}
          {formatCurrency(Math.abs(net), "IDR")}
        </p>
      </div>
    </div>
  );
}
