"use client";

import { useMemo } from "react";
import { CustomCategory, Transaction } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";
import { groupTransactionsByDate } from "@/features/transactions/utils/group-transactions-by-date";
import { formatCurrency } from "@/features/wallets/utils/format-currency";
import { TransactionCard } from "./transaction-card";

type TransactionListProps = {
  transactions: Transaction[];
  wallets: Wallet[];
  customCategories: CustomCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function TransactionList({
  transactions,
  wallets,
  customCategories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const walletMap = useMemo(() => {
    const map = new Map<string, Wallet>();
    for (const wallet of wallets) {
      map.set(wallet.id, wallet);
    }
    return map;
  }, [wallets]);

  const dateGroups = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions],
  );

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-background/60 px-4 py-8 text-center text-xs backdrop-blur-md">
        <p className="font-medium text-foreground">No transactions found</p>
        <p className="mt-1 text-[11px] text-muted">
          Add your income and expenses or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {dateGroups.map((group) => (
        <section key={group.dateKey} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-foreground">
              {group.label}
            </span>
            <div className="flex gap-2 text-[10px] font-medium">
              {group.income > 0 && (
                <span className="text-success">
                  +{formatCurrency(group.income, "IDR")}
                </span>
              )}
              {group.expense > 0 && (
                <span className="text-danger">
                  -{formatCurrency(group.expense, "IDR")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {group.transactions.map((txn) => (
              <TransactionCard
                key={txn.id}
                transaction={txn}
                wallet={walletMap.get(txn.walletId)}
                targetWallet={
                  txn.targetWalletId
                    ? walletMap.get(txn.targetWalletId)
                    : undefined
                }
                customCategories={customCategories}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
