import { Transaction } from "../types/transaction";

export type TransactionDateGroup = {
  dateKey: string;
  label: string;
  transactions: Transaction[];
  income: number;
  expense: number;
};

function formatDateLabel(dateKey: string): string {
  const date = new Date(dateKey + "T00:00:00");
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  if (dateKey === today) {
    return "Today";
  }

  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function txDateKey(txn: Transaction): string {
  return new Date(txn.date).toISOString().split("T")[0];
}

export function groupTransactionsByDate(
  transactions: Transaction[],
): TransactionDateGroup[] {
  const groupMap = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    const dateKey = txDateKey(txn);

    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, []);
    }

    groupMap.get(dateKey)!.push(txn);
  }

  const sortedKeys = Array.from(groupMap.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return sortedKeys.map((dateKey) => {
    const dayTransactions = groupMap.get(dateKey)!;

    let income = 0;
    let expense = 0;

    for (const txn of dayTransactions) {
      if (txn.doType === 2) {
        income += txn.money;
      }

      if (txn.doType === 1) {
        expense += txn.money;
      }
    }

    return {
      dateKey,
      label: formatDateLabel(dateKey),
      transactions: dayTransactions.sort((a, b) => b.date - a.date),
      income,
      expense,
    };
  });
}
