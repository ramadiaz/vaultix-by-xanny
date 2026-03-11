"use client";

import { useState } from "react";
import { Wallet } from "@/features/wallets/types/wallet";
import { WalletCard } from "./wallet-card";
import { cn } from "@/lib/utils/cn";

type WalletListTab = "active" | "archived";

type WalletListProps = {
  activeWallets: Wallet[];
  archivedWallets: Wallet[];
  onTapWallet: (wallet: Wallet) => void;
  onEditWallet: (wallet: Wallet) => void;
  onArchiveWallet: (wallet: Wallet) => void;
  onRestoreWallet: (wallet: Wallet) => void;
  onDeleteWallet: (wallet: Wallet) => void;
};

export function WalletList({
  activeWallets,
  archivedWallets,
  onTapWallet,
  onEditWallet,
  onArchiveWallet,
  onRestoreWallet,
  onDeleteWallet,
}: WalletListProps) {
  const [tab, setTab] = useState<WalletListTab>("active");

  const hasArchived = archivedWallets.length > 0;
  const wallets = tab === "active" ? activeWallets : archivedWallets;

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
            Active ({activeWallets.length})
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
              Archived ({archivedWallets.length})
            </button>
          )}
        </div>
      </div>

      {wallets.length === 0 ? (
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
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onTap={onTapWallet}
              onEdit={onEditWallet}
              onArchive={onArchiveWallet}
              onRestore={onRestoreWallet}
              onDelete={onDeleteWallet}
            />
          ))}
        </div>
      )}
    </section>
  );
}
