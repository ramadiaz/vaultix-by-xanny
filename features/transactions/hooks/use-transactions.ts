 "use client";

import { useEffect, useState } from "react";
import { Transaction } from "../types/transaction";
import {
  getStoredTransactions,
  storeTransactions,
} from "../services/transaction-storage.service";

type UseTransactionsState = {
  transactions: Transaction[];
  isLoading: boolean;
};

type UseTransactionsValue = UseTransactionsState & {
  addTransaction: (transaction: Transaction) => void;
};

export function useTransactions(): UseTransactionsValue {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    isLoading: true,
  });

  useEffect(() => {
    const storedTransactions = getStoredTransactions();

    setState({
      transactions: storedTransactions,
      isLoading: false,
    });
  }, []);

  function addTransaction(transaction: Transaction) {
    setState((previousState) => {
      const nextTransactions = [transaction, ...previousState.transactions];
      storeTransactions(nextTransactions);

      return {
        ...previousState,
        transactions: nextTransactions,
      };
    });
  }

  return {
    transactions: state.transactions,
    isLoading: state.isLoading,
    addTransaction,
  };
}

