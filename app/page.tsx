"use client";

import { useState } from "react";
import { Asset } from "@/features/wallets/types/wallet";
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
    activeAssets,
    archivedAssets,
    currencies,
    getGroupLabel,
    getCurrencyIso,
    addAsset,
    updateAsset,
    deleteAsset,
    archiveAsset,
    restoreAsset,
    adjustBalance,
  } = useWallets();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleCreateOpen() {
    setEditingAsset(null);
    setIsFormOpen(true);
  }

  function handleEditOpen(asset: Asset) {
    setEditingAsset(asset);
    setIsFormOpen(true);
  }

  function handleFormSubmit(asset: Asset) {
    if (editingAsset) {
      updateAsset(asset.uid, {
        name: asset.name,
        groupUid: asset.groupUid,
        currencyUid: asset.currencyUid,
        color: asset.color,
      });
    } else {
      addAsset(asset);
    }
  }

  function handleTapAsset(asset: Asset) {
    setDetailAsset(asset);
    setIsDetailOpen(true);
  }

  function handleDeleteOpen(asset: Asset) {
    setDeletingAsset(asset);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm(assetUid: string) {
    deleteAsset(assetUid);
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
            <WalletBalanceSummary
              assets={activeAssets}
              getCurrencyIso={getCurrencyIso}
            />

            <WalletList
              activeAssets={activeAssets}
              archivedAssets={archivedAssets}
              getGroupLabel={getGroupLabel}
              getCurrencyIso={getCurrencyIso}
              onTapAsset={handleTapAsset}
              onEditAsset={handleEditOpen}
              onArchiveAsset={(asset) => archiveAsset(asset.uid)}
              onRestoreAsset={(asset) => restoreAsset(asset.uid)}
              onDeleteAsset={handleDeleteOpen}
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
          asset={editingAsset}
          currencies={currencies}
          onSubmit={handleFormSubmit}
        />

        <WalletDetailSheet
          asset={detailAsset}
          groupLabel={detailAsset ? getGroupLabel(detailAsset.groupUid) : ""}
          currencyIso={detailAsset ? getCurrencyIso(detailAsset.currencyUid) : "IDR"}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={handleEditOpen}
          onAdjustBalance={adjustBalance}
          onArchive={(asset) => archiveAsset(asset.uid)}
          onRestore={(asset) => restoreAsset(asset.uid)}
          onDelete={handleDeleteOpen}
        />

        <DeleteWalletDialog
          asset={deletingAsset}
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
        />
      </MobileShell>
    </AuthGate>
  );
}
