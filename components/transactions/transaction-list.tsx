 "use client";

import { Transaction } from "@/features/transactions/types/transaction";

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-background px-4 py-6 text-center text-xs text-muted">
        <p className="font-medium">No transactions yet</p>
        <p className="mt-1 text-[11px]">
          Add your income and expenses to see your daily activity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((transaction) => {
        const isIncome = transaction.kind === "income";
        const sign = isIncome ? "+" : "-";

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-2xl border border-border-subtle bg-background px-4 py-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {transaction.description || "Untitled"}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted-soft">
                {transaction.kind}
              </span>
            </div>
            <span
              className={`text-sm font-semibold ${
                isIncome ? "text-success" : "text-danger"
              }`}
            >
              {sign}
              {transaction.amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

