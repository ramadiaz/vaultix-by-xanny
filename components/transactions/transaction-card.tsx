"use client";

import { useState } from "react";
import { Category } from "@/features/transactions/types/transaction";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { Asset } from "@/features/wallets/types/wallet";
import {
  getCategoryDisplayName,
  getCategoryIcon,
  DO_TYPE_KIND_MAP,
} from "@/features/transactions/config/transaction-config";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";
import { cn } from "@/lib/utils/cn";

type TransactionCardProps = {
  transaction: DisplayTransaction;
  asset: Asset | undefined;
  targetAsset?: Asset | undefined;
  categories: Category[];
  getCurrencyIso: (uid: string) => string;
  onEdit: (transaction: DisplayTransaction) => void;
  onDelete: (transaction: DisplayTransaction) => void;
};

export function TransactionCard({
  transaction,
  asset,
  targetAsset,
  categories,
  getCurrencyIso,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [showActions, setShowActions] = useState(false);

  const kind = DO_TYPE_KIND_MAP[transaction.doType];
  const isIncome = kind === "income";
  const isTransfer = kind === "transfer";
  const currencyIso = getCurrencyIso(transaction.currencyUid);
  const fee = transaction.feeTx?.money ?? 0;

  const formattedAmount = formatCurrencyByIso(transaction.money, currencyIso);
  const sign = isIncome ? "+" : "-";

  const icon = getCategoryIcon(transaction.ctgUid, categories);
  const categoryLabel = getCategoryDisplayName(transaction.ctgUid, categories);

  const displayDate = new Date(transaction.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const toAsset = targetAsset ?? (transaction.pairedTx ? undefined : undefined);
  const toAssetName = isTransfer
    ? (transaction.pairedTx
        ? (targetAsset?.name ?? asset?.name ?? "?")
        : (transaction.toAssetUid ? "?" : "?"))
    : null;

  const fromAssetForTransfer = asset;

  return (
    <div
      onClick={() => setShowActions((p) => !p)}
      className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg transition-transform duration-150 ease-out active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base">
          {icon}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {transaction.content || categoryLabel || "Transaction"}
          </span>
          <span className="text-[11px] text-muted-soft">
            {isTransfer
              ? `${fromAssetForTransfer?.name ?? "?"} → ${toAssetName}`
              : `${asset?.name ?? "Unknown"} · ${categoryLabel}`}
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
              Fee: {formatCurrencyByIso(fee, currencyIso)}
            </span>
          )}
          <span className="text-[10px] text-muted-soft">{displayDate}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 border-t border-glass-border bg-glass-bg-strong px-3 py-2">
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
