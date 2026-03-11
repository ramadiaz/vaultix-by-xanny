"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction, DoType } from "@/features/transactions/types/transaction";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/transactions/hooks/use-custom-categories";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { TransactionsLoadingSkeleton } from "@/components/loading/transactions-loading-skeleton";

export default function TransactionsPage() {
  const { assets, isLoading: isAssetsLoading, updateAssetBalance, getCurrencyIso } =
    useWallets();
  const {
    displayTransactions,
    isLoading: isTransactionsLoading,
    filter,
    setFilter,
    addIncomeExpense,
    addTransfer,
    updateIncomeExpense,
    deleteTransactionGroup,
  } = useTransactions(updateAssetBalance);
  const { categories, addCategory } = useCategories();

  const isLoading = isAssetsLoading || isTransactionsLoading;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<DisplayTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<DisplayTransaction | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleCreateOpen() {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  function handleEditOpen(transaction: DisplayTransaction) {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleDeleteOpen(transaction: DisplayTransaction) {
    setDeletingTransaction(transaction);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm(transaction: DisplayTransaction) {
    deleteTransactionGroup(transaction);
  }

  function handleSubmitIncomeExpense(params: {
    assetUid: string;
    ctgUid: string;
    doType: DoType;
    money: number;
    content: string;
    date: number;
    currencyUid: string;
  }) {
    const now = Date.now();
    const txn: Transaction = {
      uid: `${now}-${Math.random().toString(36).slice(2, 10)}`,
      assetUid: params.assetUid,
      ctgUid: params.ctgUid,
      toAssetUid: null,
      content: params.content,
      date: params.date,
      writeDate: null,
      doType: params.doType,
      money: params.money,
      inMoney: params.money,
      txUidTrans: null,
      txUidFee: null,
      isDel: false,
      utime: now,
      currencyUid: params.currencyUid,
      amountAccount: params.money,
      mark: 0,
      paid: null,
      lat: null,
      lng: null,
    };

    addIncomeExpense(txn);
  }

  function handleSubmitTransfer(params: {
    fromAssetUid: string;
    toAssetUid: string;
    money: number;
    fee: number;
    content: string;
    date: number;
    currencyUid: string;
  }) {
    addTransfer(
      params.fromAssetUid,
      params.toAssetUid,
      params.money,
      params.fee,
      params.content,
      params.date,
      params.currencyUid,
    );
  }

  function handleUpdateIncomeExpense(
    txnUid: string,
    updates: Record<string, unknown>,
    original: DisplayTransaction,
  ) {
    updateIncomeExpense(
      txnUid,
      updates as Partial<Omit<Transaction, "uid">>,
      original,
    );
  }

  return (
    <AuthGate>
      <MobileShell title="Transactions" activeTab="transactions">
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
              <TransactionsLoadingSkeleton />
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
              <TransactionSummary transactions={displayTransactions} />

              <TransactionFilters
                filter={filter}
                assets={assets}
                onFilterChange={setFilter}
              />

              <TransactionList
                transactions={displayTransactions}
                assets={assets}
                categories={categories}
                getCurrencyIso={getCurrencyIso}
                onEdit={handleEditOpen}
                onDelete={handleDeleteOpen}
              />
              <div className="h-40" />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="button"
          size="lg"
          className="fixed bottom-20 right-4 z-20 shadow-lg shadow-black/40"
          onClick={handleCreateOpen}
        >
          Add transaction
        </Button>

        <TransactionFormSheet
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          assets={assets}
          categories={categories}
          transaction={editingTransaction}
          onSubmitIncomeExpense={handleSubmitIncomeExpense}
          onSubmitTransfer={handleSubmitTransfer}
          onUpdateIncomeExpense={handleUpdateIncomeExpense}
          onAddCategory={addCategory}
        />

        <DeleteTransactionDialog
          transaction={deletingTransaction}
          categories={categories}
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
        />
      </MobileShell>
    </AuthGate>
  );
}
