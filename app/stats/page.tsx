"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PeriodSelector } from "@/components/stats/period-selector";
import { StatsSummaryCards } from "@/components/stats/stats-summary-cards";
import { CashflowChart } from "@/components/stats/cashflow-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import { useStats } from "@/features/stats/hooks/use-stats";
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
  } = useStats();

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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileShell>
  );
}
