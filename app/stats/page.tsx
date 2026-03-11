"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PeriodSelector } from "@/components/stats/period-selector";
import { StatsSummaryCards } from "@/components/stats/stats-summary-cards";
import { CashflowChart } from "@/components/stats/cashflow-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import { CategoryTransactionsSheet } from "@/components/stats/category-transactions-sheet";
import { useStats } from "@/features/stats/hooks/use-stats";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
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
  const { assets, getCurrencyIso } = useWallets();
  const { categories } = useCategories();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryBreakdownItem | null>(null);
  const [selectedDoType, setSelectedDoType] = useState<1 | 2>(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  function handleCategoryClick(item: CategoryBreakdownItem, doType: 1 | 2) {
    setSelectedCategory(item);
    setSelectedDoType(doType);
    setIsSheetOpen(true);
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
        />
      </div>
    </MobileShell>
  );
}
