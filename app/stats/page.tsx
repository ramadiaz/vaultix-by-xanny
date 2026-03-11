"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction, DoType } from "@/features/transactions/types/transaction";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PeriodSelector } from "@/components/stats/period-selector";
import { StatsSummaryCards } from "@/components/stats/stats-summary-cards";
import { CashflowChart } from "@/components/stats/cashflow-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import { CategoryTransactionsSheet } from "@/components/stats/category-transactions-sheet";
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { useStats } from "@/features/stats/hooks/use-stats";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useCategories } from "@/features/transactions/hooks/use-custom-categories";
import { CategoryBreakdownItem } from "@/features/stats/utils/stats-utils";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { StatsLoadingSkeleton } from "@/components/loading/stats-loading-skeleton";

export default function StatsPage() {
  const {
    isLoading,
    period,
    setPeriod,
    totalIncome,
    totalExpense,
    net,
    cashflowData,
    expenseCategoryBreakdown,
    incomeCategoryBreakdown,
    totalTransactionCount,
    getTransactionsByCategory,
  } = useStats();
  const { assets, updateAssetBalance, getCurrencyIso } = useWallets();
  const {
    addIncomeExpense,
    addTransfer,
    updateIncomeExpense,
    deleteTransactionGroup,
  } = useTransactions(updateAssetBalance);
  const { categories, addCategory } = useCategories();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryBreakdownItem | null>(null);
  const [selectedDoType, setSelectedDoType] = useState<1 | 2>(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<DisplayTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<DisplayTransaction | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleCategoryClick(item: CategoryBreakdownItem, doType: 1 | 2) {
    setSelectedCategory(item);
    setSelectedDoType(doType);
    setIsSheetOpen(true);
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

  const categoryTransactions = selectedCategory != null
    ? getTransactionsByCategory(selectedCategory.ctgUid, selectedDoType)
    : [];
  const displayTransactions: DisplayTransaction[] = categoryTransactions.map(
    (t) => t as DisplayTransaction,
  );

  return (
    <MobileShell title="Stats" activeTab="stats">
      <div className="mx-auto max-w-xl space-y-4 pb-24">
        <PeriodSelector value={period} onChange={setPeriod} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <StatsLoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              <StatsSummaryCards
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                net={net}
                transactionCount={totalTransactionCount}
              />

            <CashflowChart data={cashflowData} period={period} />

              <CategoryBreakdown
                expenseBreakdown={expenseCategoryBreakdown}
                incomeBreakdown={incomeCategoryBreakdown}
                onCategoryClick={handleCategoryClick}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CategoryTransactionsSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          categoryItem={selectedCategory}
          doType={selectedDoType}
          transactions={displayTransactions}
          assets={assets}
          categories={categories}
          getCurrencyIso={getCurrencyIso}
          onEdit={handleEditOpen}
          onDelete={handleDeleteOpen}
        />

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
      </div>
    </MobileShell>
  );
}
