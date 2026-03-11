"use client";

import { useState } from "react";
import { Wallet } from "@/features/wallets/types/wallet";
import { WALLET_COLOR_MAP, WALLET_TYPE_LABELS } from "@/features/wallets/config/wallet-config";
import { formatCurrency } from "@/features/wallets/utils/format-currency";
import { cn } from "@/lib/utils/cn";

type WalletCardProps = {
  wallet: Wallet;
  onTap: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onArchive: (wallet: Wallet) => void;
  onRestore?: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
};

export function WalletCard({
  wallet,
  onTap,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: WalletCardProps) {
  const [showActions, setShowActions] = useState(false);
  const colors = WALLET_COLOR_MAP[wallet.color] ?? WALLET_COLOR_MAP.sky;

  function handleToggleActions(event: React.MouseEvent) {
    event.stopPropagation();
    setShowActions((previous) => !previous);
  }

  return (
    <div
      onClick={() => onTap(wallet)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border-subtle bg-background/80 backdrop-blur-md transition-all active:scale-[0.98]",
        wallet.isArchived && "opacity-60",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase",
            colors.bg,
            colors.text,
          )}
        >
          {wallet.name.slice(0, 2)}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {wallet.name}
          </span>
          <span className="text-[11px] text-muted-soft">
            {WALLET_TYPE_LABELS[wallet.type]} · {wallet.currency}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(wallet.balance, wallet.currency)}
          </span>
          {wallet.isArchived && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-warning">
              Archived
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleActions}
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-accent-soft"
        >
          <span className="text-base leading-none">⋮</span>
        </button>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 border-t border-border-subtle bg-background-soft px-3 py-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowActions(false);
              onEdit(wallet);
            }}
            className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-soft"
          >
            Edit
          </button>

          {wallet.isArchived ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowActions(false);
                onRestore?.(wallet);
              }}
              className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-success hover:bg-success/10"
            >
              Restore
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowActions(false);
                onArchive(wallet);
              }}
              className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-warning hover:bg-warning/10"
            >
              Archive
            </button>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowActions(false);
              onDelete(wallet);
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
