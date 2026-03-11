"use client";

import { useState } from "react";
import { Asset } from "@/features/wallets/types/wallet";
import { WalletCard } from "./wallet-card";
import { cn } from "@/lib/utils/cn";

type WalletListTab = "active" | "archived";

type WalletListProps = {
  activeAssets: Asset[];
  archivedAssets: Asset[];
  getGroupLabel: (groupUid: string) => string;
  getCurrencyIso: (currencyUid: string) => string;
  onTapAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onArchiveAsset: (asset: Asset) => void;
  onRestoreAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
};

export function WalletList({
  activeAssets,
  archivedAssets,
  getGroupLabel,
  getCurrencyIso,
  onTapAsset,
  onEditAsset,
  onArchiveAsset,
  onRestoreAsset,
  onDeleteAsset,
}: WalletListProps) {
  const [tab, setTab] = useState<WalletListTab>("active");

  const hasArchived = archivedAssets.length > 0;
  const assets = tab === "active" ? activeAssets : archivedAssets;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition",
              tab === "active"
                ? "bg-primary/15 text-primary"
                : "text-muted hover:text-foreground",
            )}
          >
            Active ({activeAssets.length})
          </button>
          {hasArchived && (
            <button
              type="button"
              onClick={() => setTab("archived")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition",
                tab === "archived"
                  ? "bg-warning/15 text-warning"
                  : "text-muted hover:text-foreground",
              )}
            >
              Archived ({archivedAssets.length})
            </button>
          )}
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-background/60 px-4 py-8 text-center text-xs backdrop-blur-md">
          <p className="font-medium text-foreground">
            {tab === "active" ? "No wallets yet" : "No archived wallets"}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {tab === "active"
              ? "Create your first wallet to start tracking your money."
              : "Wallets you archive will appear here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {assets.map((asset) => (
            <WalletCard
              key={asset.uid}
              asset={asset}
              groupLabel={getGroupLabel(asset.groupUid)}
              currencyIso={getCurrencyIso(asset.currencyUid)}
              onTap={onTapAsset}
              onEdit={onEditAsset}
              onArchive={onArchiveAsset}
              onRestore={onRestoreAsset}
              onDelete={onDeleteAsset}
            />
          ))}
        </div>
      )}
    </section>
  );
}
