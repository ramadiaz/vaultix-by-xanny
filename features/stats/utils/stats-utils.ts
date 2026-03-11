import { Transaction, Category } from "@/features/transactions/types/transaction";
import { getCategoryIcon } from "@/features/transactions/config/transaction-config";

export type StatPeriod = "week" | "month" | "3months" | "year";

export type PeriodRange = {
  from: number;
  to: number;
};

export function getPeriodRange(period: StatPeriod): PeriodRange {
  const now = new Date();
  const to = now.getTime();

  switch (period) {
    case "week": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from: from.getTime(), to };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.getTime(), to };
    }
    case "3months": {
      const from = new Date(now);
      from.setMonth(now.getMonth() - 2);
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      return { from: from.getTime(), to };
    }
    case "year": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.getTime(), to };
    }
  }
}

export type CashflowPoint = {
  label: string;
  shortLabel: string;
  income: number;
  expense: number;
};

export function buildDailyCashflow(
  transactions: Transaction[],
  from: number,
  to: number,
): CashflowPoint[] {
  const points = new Map<string, CashflowPoint>();

  const cursor = new Date(from);
  const end = new Date(to);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    const label = cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const shortLabel = String(cursor.getDate());
    points.set(key, { label, shortLabel, income: 0, expense: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const tx of transactions) {
    if (tx.isDel) continue;
    const key = new Date(tx.date).toISOString().slice(0, 10);
    const point = points.get(key);
    if (!point) continue;
    if (tx.doType === 2) point.income += tx.money;
    if (tx.doType === 1) point.expense += tx.money;
  }

  return Array.from(points.values());
}

export function buildMonthlyCashflow(
  transactions: Transaction[],
  from: number,
): CashflowPoint[] {
  const points = new Map<string, CashflowPoint>();

  const cursor = new Date(from);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(1);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const shortLabel = cursor.toLocaleDateString("en-US", { month: "short" });
    points.set(key, { label, shortLabel, income: 0, expense: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const tx of transactions) {
    if (tx.isDel) continue;
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = points.get(key);
    if (!point) continue;
    if (tx.doType === 2) point.income += tx.money;
    if (tx.doType === 1) point.expense += tx.money;
  }

  return Array.from(points.values());
}

export type CategoryBreakdownItem = {
  ctgUid: string | null;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
};

export const CHART_COLORS = [
  "#06B6D4",
  "#10B981",
  "#22D3EE",
  "#14B8A6",
  "#6366F1",
  "#8B5CF6",
  "#FBBF24",
  "#F97316",
  "#F43F5E",
  "#64748B",
];

export function buildCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  doType: 1 | 2,
): CategoryBreakdownItem[] {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.isDel) continue;
    if (tx.doType !== doType) continue;
    const key = tx.ctgUid ?? "__uncategorized__";
    totals.set(key, (totals.get(key) ?? 0) + tx.money);
  }

  const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v, 0);
  if (grandTotal === 0) return [];

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, amount], index) => {
      const uid = key === "__uncategorized__" ? null : key;
      const cat = categories.find((c) => c.uid === uid);
      const icon = getCategoryIcon(uid, categories);
      const rawName = cat?.name ?? "Uncategorized";
      const name = rawName
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s*/u, "")
        .trim();

      return {
        ctgUid: uid,
        name,
        icon,
        amount,
        percentage: (amount / grandTotal) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
}

export function formatCompactAmount(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}
