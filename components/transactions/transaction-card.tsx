"use client";

import { useState } from "react";
import { CustomCategory, Transaction } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/transactions/config/transaction-config";
import { formatCurrency } from "@/features/wallets/utils/format-currency";
import { cn } from "@/lib/utils/cn";

type TransactionCardProps = {
  transaction: Transaction;
  wallet: Wallet | undefined;
  targetWallet?: Wallet | undefined;
  customCategories: CustomCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function TransactionCard({
  transaction,
  wallet,
  targetWallet,
  customCategories,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [showActions, setShowActions] = useState(false);

  const isIncome = transaction.kind === "income";
  const isTransfer = transaction.kind === "transfer";
  const currency = wallet?.currency ?? "IDR";
  const fee = transaction.fee ?? 0;

  const formattedAmount = formatCurrency(transaction.amount, currency);
  const sign = isIncome ? "+" : "-";

  const categoryIcon = getCategoryIcon(transaction.category, customCategories);
  const categoryLabel = getCategoryLabel(transaction.category, customCategories);

  const displayDate = new Date(transaction.occurredAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  );

  return (
    <div
      onClick={() => setShowActions((p) => !p)}
      className="overflow-hidden rounded-2xl border border-border-subtle bg-background/80 backdrop-blur-md transition active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base">
          {categoryIcon}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {transaction.description || categoryLabel}
          </span>
          <span className="text-[11px] text-muted-soft">
            {isTransfer
              ? `${wallet?.name ?? "?"} → ${targetWallet?.name ?? "?"}`
              : `${wallet?.name ?? "Unknown"} · ${categoryLabel}`}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span
            className={cn(
              "text-sm font-semibold",
              isIncome
                ? "text-success"
                : isTransfer
                  ? "text-primary"
                  : "text-danger",
            )}
          >
            {isTransfer ? "" : sign}
            {formattedAmount}
          </span>
          {isTransfer && fee > 0 && (
            <span className="text-[10px] font-medium text-warning">
              Fee: {formatCurrency(fee, currency)}
            </span>
          )}
          <span className="text-[10px] text-muted-soft">{displayDate}</span>
        </div>
      </div>

      {transaction.note && !showActions && (
        <div className="border-t border-border-subtle bg-background-soft/50 px-4 py-1.5">
          <p className="truncate text-[11px] text-muted-soft">
            {transaction.note}
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-1 border-t border-border-subtle bg-background-soft px-3 py-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowActions(false);
              onEdit(transaction);
            }}
            className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-soft"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowActions(false);
              onDelete(transaction);
            }}
            className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-danger hover:bg-danger/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
