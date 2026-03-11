"use client";

import { useState } from "react";
import { Wallet } from "@/features/wallets/types/wallet";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { WalletBalanceSummary } from "@/components/wallets/wallet-balance-summary";
import { WalletList } from "@/components/wallets/wallet-list";
import { WalletFormSheet } from "@/components/wallets/wallet-form-sheet";
import { WalletDetailSheet } from "@/components/wallets/wallet-detail-sheet";
import { DeleteWalletDialog } from "@/components/wallets/delete-wallet-dialog";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const {
    isLoading,
    activeWallets,
    archivedWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    archiveWallet,
    restoreWallet,
    adjustBalance,
  } = useWallets();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [detailWallet, setDetailWallet] = useState<Wallet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleCreateOpen() {
    setEditingWallet(null);
    setIsFormOpen(true);
  }

  function handleEditOpen(wallet: Wallet) {
    setEditingWallet(wallet);
    setIsFormOpen(true);
  }

  function handleFormSubmit(wallet: Wallet) {
    if (editingWallet) {
      updateWallet(wallet.id, {
        name: wallet.name,
        type: wallet.type,
        currency: wallet.currency,
        color: wallet.color,
      });
    } else {
      addWallet(wallet);
    }
  }

  function handleTapWallet(wallet: Wallet) {
    setDetailWallet(wallet);
    setIsDetailOpen(true);
  }

  function handleDeleteOpen(wallet: Wallet) {
    setDeletingWallet(wallet);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm(walletId: string) {
    deleteWallet(walletId);
  }

  return (
    <AuthGate>
      <MobileShell title="Overview" activeTab="wallets">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted">
            Loading your wallets
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <WalletBalanceSummary wallets={activeWallets} />

            <WalletList
              activeWallets={activeWallets}
              archivedWallets={archivedWallets}
              onTapWallet={handleTapWallet}
              onEditWallet={handleEditOpen}
              onArchiveWallet={(wallet) => archiveWallet(wallet.id)}
              onRestoreWallet={(wallet) => restoreWallet(wallet.id)}
              onDeleteWallet={handleDeleteOpen}
            />
          </div>
        )}

        <Button
          type="button"
          size="lg"
          className="fixed bottom-20 right-4 z-20 shadow-lg shadow-black/40"
          onClick={handleCreateOpen}
        >
          Add wallet
        </Button>

        <WalletFormSheet
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          wallet={editingWallet}
          onSubmit={handleFormSubmit}
        />

        <WalletDetailSheet
          wallet={detailWallet}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={handleEditOpen}
          onAdjustBalance={adjustBalance}
          onArchive={(wallet) => archiveWallet(wallet.id)}
          onRestore={(wallet) => restoreWallet(wallet.id)}
          onDelete={handleDeleteOpen}
        />

        <DeleteWalletDialog
          wallet={deletingWallet}
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
        />
      </MobileShell>
    </AuthGate>
  );
}
