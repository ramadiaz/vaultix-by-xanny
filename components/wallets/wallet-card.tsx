"use client";

import { useState } from "react";
import { Asset } from "@/features/wallets/types/wallet";
import { ASSET_COLOR_MAP } from "@/features/wallets/config/wallet-config";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";
import { cn } from "@/lib/utils/cn";

type WalletCardProps = {
  asset: Asset;
  groupLabel: string;
  currencyIso: string;
  onTap: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onArchive: (asset: Asset) => void;
  onRestore?: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

export function WalletCard({
  asset,
  groupLabel,
  currencyIso,
  onTap,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: WalletCardProps) {
  const [showActions, setShowActions] = useState(false);
  const colors = ASSET_COLOR_MAP[asset.color] ?? ASSET_COLOR_MAP.sky;

  function handleToggleActions(event: React.MouseEvent) {
    event.stopPropagation();
    setShowActions((prev) => !prev);
  }

  return (
    <div
      onClick={() => onTap(asset)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-glass-border bg-glass-bg transition-transform duration-150 ease-out active:scale-[0.99]",
        asset.isArchived && "opacity-60",
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
          {asset.name.slice(0, 2)}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {asset.name}
          </span>
          <span className="text-[11px] text-muted-soft">
            {groupLabel} · {currencyIso}
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {formatCurrencyByIso(asset.balance, currencyIso)}
          </span>
          {asset.isArchived && (
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
        <div className="flex items-center gap-1 border-t border-glass-border bg-glass-bg-strong px-3 py-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowActions(false);
              onEdit(asset);
            }}
            className="flex-1 rounded-xl px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-soft"
          >
            Edit
          </button>

          {asset.isArchived ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowActions(false);
                onRestore?.(asset);
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
                onArchive(asset);
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
              onDelete(asset);
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
