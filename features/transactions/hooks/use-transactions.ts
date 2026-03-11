"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Transaction, TransactionKind } from "../types/transaction";
import {
  getStoredTransactions,
  storeTransactions,
} from "../services/transaction-storage.service";

type WalletBalanceUpdater = (walletId: string, delta: number) => void;

type UseTransactionsState = {
  transactions: Transaction[];
  isLoading: boolean;
};

type TransactionFilter = {
  walletId?: string;
  kind?: TransactionKind;
  search?: string;
  fromDate?: string;
  toDate?: string;
};

type UseTransactionsValue = UseTransactionsState & {
  filteredTransactions: Transaction[];
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  getTransactionsByWallet: (walletId: string) => Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>,
    originalTransaction: Transaction,
  ) => void;
  deleteTransaction: (transaction: Transaction) => void;
};

function applyBalanceForAdd(
  transaction: Transaction,
  updateBalance: WalletBalanceUpdater,
) {
  const fee = transaction.fee ?? 0;

  if (transaction.kind === "income") {
    updateBalance(transaction.walletId, transaction.amount);
  }

  if (transaction.kind === "expense") {
    updateBalance(transaction.walletId, -transaction.amount);
  }

  if (transaction.kind === "transfer" && transaction.targetWalletId) {
    updateBalance(transaction.walletId, -(transaction.amount + fee));
    updateBalance(transaction.targetWalletId, transaction.amount);
  }
}

function reverseBalanceForRemove(
  transaction: Transaction,
  updateBalance: WalletBalanceUpdater,
) {
  const fee = transaction.fee ?? 0;

  if (transaction.kind === "income") {
    updateBalance(transaction.walletId, -transaction.amount);
  }

  if (transaction.kind === "expense") {
    updateBalance(transaction.walletId, transaction.amount);
  }

  if (transaction.kind === "transfer" && transaction.targetWalletId) {
    updateBalance(transaction.walletId, transaction.amount + fee);
    updateBalance(transaction.targetWalletId, -transaction.amount);
  }
}

export function useTransactions(
  updateWalletBalance: WalletBalanceUpdater,
): UseTransactionsValue {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    isLoading: true,
  });

  const [filter, setFilter] = useState<TransactionFilter>({});

  useEffect(() => {
    setState({
      transactions: getStoredTransactions(),
      isLoading: false,
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = state.transactions;

    if (filter.walletId) {
      result = result.filter(
        (txn) =>
          txn.walletId === filter.walletId ||
          txn.targetWalletId === filter.walletId,
      );
    }

    if (filter.kind) {
      result = result.filter((txn) => txn.kind === filter.kind);
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (txn) =>
          txn.description.toLowerCase().includes(term) ||
          txn.note.toLowerCase().includes(term) ||
          txn.category.toLowerCase().includes(term),
      );
    }

    if (filter.fromDate) {
      result = result.filter((txn) => txn.occurredAt >= filter.fromDate!);
    }

    if (filter.toDate) {
      const toEnd = filter.toDate + "T23:59:59.999Z";
      result = result.filter((txn) => txn.occurredAt <= toEnd);
    }

    return result.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [state.transactions, filter]);

  const getTransactionsByWallet = useCallback(
    (walletId: string) =>
      state.transactions
        .filter(
          (txn) =>
            txn.walletId === walletId || txn.targetWalletId === walletId,
        )
        .sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        ),
    [state.transactions],
  );

  function persist(nextTransactions: Transaction[]) {
    storeTransactions(nextTransactions);
  }

  function addTransaction(transaction: Transaction) {
    applyBalanceForAdd(transaction, updateWalletBalance);

    setState((previous) => {
      const nextTransactions = [transaction, ...previous.transactions];
      persist(nextTransactions);
      return { ...previous, transactions: nextTransactions };
    });
  }

  function updateTransaction(
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>,
    originalTransaction: Transaction,
  ) {
    reverseBalanceForRemove(originalTransaction, updateWalletBalance);

    setState((previous) => {
      const nextTransactions = previous.transactions.map((txn) => {
        if (txn.id !== transactionId) {
          return txn;
        }

        const updated: Transaction = {
          ...txn,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        applyBalanceForAdd(updated, updateWalletBalance);
        return updated;
      });

      persist(nextTransactions);
      return { ...previous, transactions: nextTransactions };
    });
  }

  function deleteTransaction(transaction: Transaction) {
    reverseBalanceForRemove(transaction, updateWalletBalance);

    setState((previous) => {
      const nextTransactions = previous.transactions.filter(
        (txn) => txn.id !== transaction.id,
      );
      persist(nextTransactions);
      return { ...previous, transactions: nextTransactions };
    });
  }

  return {
    transactions: state.transactions,
    filteredTransactions,
    isLoading: state.isLoading,
    filter,
    setFilter,
    getTransactionsByWallet,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
