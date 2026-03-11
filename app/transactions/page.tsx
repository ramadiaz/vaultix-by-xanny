"use client";

import { useState } from "react";
import { Transaction } from "@/features/transactions/types/transaction";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCustomCategories } from "@/features/transactions/hooks/use-custom-categories";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const { wallets, isLoading: isWalletsLoading, updateWalletBalance } =
    useWallets();
  const {
    filteredTransactions,
    isLoading: isTransactionsLoading,
    filter,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(updateWalletBalance);
  const { customCategories, addCategory } = useCustomCategories();

  const isLoading = isWalletsLoading || isTransactionsLoading;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleCreateOpen() {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  function handleEditOpen(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleDeleteOpen(transaction: Transaction) {
    setDeletingTransaction(transaction);
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm(transaction: Transaction) {
    deleteTransaction(transaction);
  }

  return (
    <AuthGate>
      <MobileShell title="Transactions" activeTab="transactions">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted">
            Loading your activity
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TransactionSummary transactions={filteredTransactions} />

            <TransactionFilters
              filter={filter}
              wallets={wallets}
              onFilterChange={setFilter}
            />

            <TransactionList
              transactions={filteredTransactions}
              wallets={wallets}
              customCategories={customCategories}
              onEdit={handleEditOpen}
              onDelete={handleDeleteOpen}
            />
          </div>
        )}

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
          wallets={wallets}
          customCategories={customCategories}
          transaction={editingTransaction}
          onSubmit={addTransaction}
          onUpdate={updateTransaction}
          onAddCustomCategory={addCategory}
        />

        <DeleteTransactionDialog
          transaction={deletingTransaction}
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
        />
      </MobileShell>
    </AuthGate>
  );
}
