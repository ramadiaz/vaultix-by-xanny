"use client";

import { MobileShell } from "@/components/layout/mobile-shell";
import { PeriodSelector } from "@/components/stats/period-selector";
import { StatsSummaryCards } from "@/components/stats/stats-summary-cards";
import { CashflowChart } from "@/components/stats/cashflow-chart";
import { CategoryBreakdown } from "@/components/stats/category-breakdown";
import { useStats } from "@/features/stats/hooks/use-stats";

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

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-2xl border border-border-subtle bg-accent-soft/40"
                />
              ))}
            </div>
            <div className="h-[210px] animate-pulse rounded-2xl border border-border-subtle bg-accent-soft/40" />
            <div className="h-[320px] animate-pulse rounded-2xl border border-border-subtle bg-accent-soft/40" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </MobileShell>
  );
}
