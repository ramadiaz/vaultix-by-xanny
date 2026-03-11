"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Asset } from "@/features/wallets/types/wallet";
import { Transaction } from "@/features/transactions/types/transaction";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { WalletBalanceSummary } from "@/components/wallets/wallet-balance-summary";
import { WalletList } from "@/components/wallets/wallet-list";
import { WalletFormSheet } from "@/components/wallets/wallet-form-sheet";
import { WalletDetailSheet } from "@/components/wallets/wallet-detail-sheet";
import { DeleteWalletDialog } from "@/components/wallets/delete-wallet-dialog";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/transactions/hooks/use-custom-categories";
import {
  DIFFERENCE_INCOME_CATEGORY_UID,
  DIFFERENCE_EXPENSE_CATEGORY_UID,
} from "@/features/transactions/config/transaction-config";
import { Button } from "@/components/ui/button";
import { WalletsLoadingSkeleton } from "@/components/loading/wallets-loading-skeleton";

export default function HomePage() {
  const {
    isLoading,
    activeAssets,
    archivedAssets,
    currencies,
    getGroupLabel,
    getCurrencyIso,
    getAssetByUid,
    addAsset,
    updateAsset,
    deleteAsset,
    archiveAsset,
    restoreAsset,
    adjustBalance,
    updateAssetBalance,
  } = useWallets();
  const { addIncomeExpense } = useTransactions(updateAssetBalance);
  const { categories, addCategory } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [detailAssetUid, setDetailAssetUid] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailAsset = detailAssetUid ? getAssetByUid(detailAssetUid) ?? null : null;
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
    setDetailAssetUid(asset.uid);
    setIsDetailOpen(true);
  }

  function handleDetailOpenChange(open: boolean) {
    setIsDetailOpen(open);
    if (!open) setDetailAssetUid(null);
  }

  function handleDeleteOpen(asset: Asset) {
    setDeletingAsset(asset);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm(assetUid: string) {
    deleteAsset(assetUid);
  }

  function handleSetFinalBalance(asset: Asset, targetBalance: number) {
    const delta = targetBalance - asset.balance;
    if (delta === 0) return;

    const isIncome = delta > 0;
    const doType = isIncome ? 2 : 1;
    const money = Math.abs(delta);
    const ctgUid = isIncome ? DIFFERENCE_INCOME_CATEGORY_UID : DIFFERENCE_EXPENSE_CATEGORY_UID;

    const diffIncomeExists = categories.some(
      (c) => c.uid === DIFFERENCE_INCOME_CATEGORY_UID && !c.isDel,
    );
    const diffExpenseExists = categories.some(
      (c) => c.uid === DIFFERENCE_EXPENSE_CATEGORY_UID && !c.isDel,
    );

    const now = Date.now();
    if (categories.length > 0) {
      if (isIncome && !diffIncomeExists) {
        addCategory({
          uid: DIFFERENCE_INCOME_CATEGORY_UID,
          name: "Difference",
          type: 0,
          status: 0,
          pUid: null,
          orderSeq: 100,
          isDel: false,
          utime: now,
        });
      }
      if (!isIncome && !diffExpenseExists) {
        addCategory({
          uid: DIFFERENCE_EXPENSE_CATEGORY_UID,
          name: "Difference",
          type: 1,
          status: 0,
          pUid: null,
          orderSeq: 100,
          isDel: false,
          utime: now,
        });
      }
    }

    const txn: Transaction = {
      uid: `${now}-${Math.random().toString(36).slice(2, 10)}`,
      assetUid: asset.uid,
      ctgUid,
      toAssetUid: null,
      content: "Difference",
      date: now,
      writeDate: null,
      doType: doType as 1 | 2,
      money,
      inMoney: money,
      txUidTrans: null,
      txUidFee: null,
      isDel: false,
      utime: now,
      currencyUid: asset.currencyUid,
      amountAccount: money,
      mark: 0,
      paid: null,
      lat: null,
      lng: null,
    };

    addIncomeExpense(txn);
  }

  return (
    <AuthGate>
      <MobileShell title="Overview" activeTab="wallets">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-4"
            >
              <WalletsLoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

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
          onOpenChange={handleDetailOpenChange}
          onEdit={handleEditOpen}
          onAdjustBalance={adjustBalance}
          onSetFinalBalance={handleSetFinalBalance}
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
