"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Transaction, Category } from "@/features/transactions/types/transaction";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import {
  StatPeriod,
  getPeriodRange,
  buildDailyCashflow,
  buildMonthlyCashflow,
  buildCategoryBreakdown,
  CashflowPoint,
  CategoryBreakdownItem,
} from "../utils/stats-utils";

type UseStatsValue = {
  isLoading: boolean;
  period: StatPeriod;
  setPeriod: (p: StatPeriod) => void;
  totalIncome: number;
  totalExpense: number;
  net: number;
  cashflowData: CashflowPoint[];
  expenseCategoryBreakdown: CategoryBreakdownItem[];
  incomeCategoryBreakdown: CategoryBreakdownItem[];
  totalTransactionCount: number;
  getTransactionsByCategory: (ctgUid: string | null, doType: 1 | 2) => Transaction[];
};

export function useStats(): UseStatsValue {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<StatPeriod>("month");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [txns, cats] = await Promise.all([
        getStoredTransactions(),
        getStoredCategories(),
      ]);
      if (!mounted) return;
      setTransactions(txns);
      setCategories(cats);
      setIsLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const { from, to } = useMemo(() => getPeriodRange(period), [period]);

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => !t.isDel && t.date >= from && t.date <= to),
    [transactions, from, to],
  );

  const { totalIncome, totalExpense, totalTransactionCount } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let count = 0;
    for (const tx of filteredTransactions) {
      if (tx.doType === 2) {
        income += tx.money;
        count++;
      }
      if (tx.doType === 1) {
        expense += tx.money;
        count++;
      }
    }
    return { totalIncome: income, totalExpense: expense, totalTransactionCount: count };
  }, [filteredTransactions]);

  const cashflowData = useMemo(() => {
    if (period === "week" || period === "month") {
      return buildDailyCashflow(filteredTransactions, from, to);
    }
    return buildMonthlyCashflow(filteredTransactions, from);
  }, [filteredTransactions, period, from, to]);

  const expenseCategoryBreakdown = useMemo(
    () => buildCategoryBreakdown(filteredTransactions, categories, 1),
    [filteredTransactions, categories],
  );

  const incomeCategoryBreakdown = useMemo(
    () => buildCategoryBreakdown(filteredTransactions, categories, 2),
    [filteredTransactions, categories],
  );

  const getTransactionsByCategory = useCallback(
    (ctgUid: string | null, doType: 1 | 2): Transaction[] => {
      return filteredTransactions.filter(
        (t) => t.doType === doType && (t.ctgUid ?? null) === ctgUid,
      );
    },
    [filteredTransactions],
  );

  return {
    isLoading,
    period,
    setPeriod,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    cashflowData,
    expenseCategoryBreakdown,
    incomeCategoryBreakdown,
    totalTransactionCount,
    getTransactionsByCategory,
  };
}
