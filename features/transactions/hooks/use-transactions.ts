"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DoType, Transaction } from "../types/transaction";
import {
  getStoredTransactions,
  storeTransactions,
} from "../services/transaction-storage.service";

type AssetBalanceUpdater = (assetUid: string, delta: number) => void;

type UseTransactionsState = {
  transactions: Transaction[];
  isLoading: boolean;
};

type TransactionFilter = {
  assetUid?: string;
  doType?: DoType;
  search?: string;
  fromDate?: string;
  toDate?: string;
};

export type DisplayTransaction = Transaction & {
  pairedTx?: Transaction;
  feeTx?: Transaction;
};

type UseTransactionsValue = UseTransactionsState & {
  displayTransactions: DisplayTransaction[];
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  getTransactionsByAsset: (assetUid: string) => Transaction[];
  addIncomeExpense: (txn: Transaction) => void;
  addTransfer: (
    fromAssetUid: string,
    toAssetUid: string,
    money: number,
    fee: number,
    content: string,
    date: number,
    currencyUid: string,
  ) => void;
  updateIncomeExpense: (
    txnUid: string,
    updates: Partial<Omit<Transaction, "uid">>,
    original: Transaction,
  ) => void;
  deleteTransactionGroup: (txn: DisplayTransaction) => void;
};

function generateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function applyBalanceForTx(txn: Transaction, updateBalance: AssetBalanceUpdater) {
  if (txn.doType === 2) {
    updateBalance(txn.assetUid, txn.money);
  }
  if (txn.doType === 1) {
    updateBalance(txn.assetUid, -txn.money);
  }
  if (txn.doType === 3) {
    updateBalance(txn.assetUid, -txn.money);
  }
  if (txn.doType === 4 && txn.assetUid) {
    updateBalance(txn.assetUid, txn.money);
  }
}

function reverseBalanceForTx(txn: Transaction, updateBalance: AssetBalanceUpdater) {
  if (txn.doType === 2) {
    updateBalance(txn.assetUid, -txn.money);
  }
  if (txn.doType === 1) {
    updateBalance(txn.assetUid, txn.money);
  }
  if (txn.doType === 3) {
    updateBalance(txn.assetUid, txn.money);
  }
  if (txn.doType === 4 && txn.assetUid) {
    updateBalance(txn.assetUid, -txn.money);
  }
}

export function useTransactions(
  updateAssetBalance: AssetBalanceUpdater,
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

  const displayTransactions: DisplayTransaction[] = useMemo(() => {
    const txMap = new Map(state.transactions.map((t) => [t.uid, t]));
    const pairedUids = new Set<string>();
    const feeUids = new Set<string>();
    const result: DisplayTransaction[] = [];

    for (const txn of state.transactions) {
      if (txn.isDel) continue;

      if (txn.doType === 4) {
        pairedUids.add(txn.uid);
        continue;
      }

      if (txn.txUidFee) {
        feeUids.add(txn.txUidFee);
      }
    }

    for (const txn of state.transactions) {
      if (txn.isDel) continue;
      if (pairedUids.has(txn.uid)) continue;
      if (feeUids.has(txn.uid)) continue;

      const display: DisplayTransaction = { ...txn };

      if (txn.doType === 3 && txn.txUidTrans) {
        display.pairedTx = txMap.get(txn.txUidTrans);
      }

      if (txn.txUidFee) {
        display.feeTx = txMap.get(txn.txUidFee);
      }

      result.push(display);
    }

    let filtered = result;

    if (filter.assetUid) {
      filtered = filtered.filter(
        (t) =>
          t.assetUid === filter.assetUid ||
          t.toAssetUid === filter.assetUid ||
          t.pairedTx?.assetUid === filter.assetUid,
      );
    }

    if (filter.doType !== undefined) {
      if (filter.doType === 3) {
        filtered = filtered.filter((t) => t.doType === 3);
      } else {
        filtered = filtered.filter((t) => t.doType === filter.doType);
      }
    }

    if (filter.search) {
      const term = filter.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.content ?? "").toLowerCase().includes(term) ||
          (t.ctgUid ?? "").toLowerCase().includes(term),
      );
    }

    if (filter.fromDate) {
      const from = new Date(filter.fromDate).getTime();
      filtered = filtered.filter((t) => t.date >= from);
    }

    if (filter.toDate) {
      const to = new Date(filter.toDate + "T23:59:59.999Z").getTime();
      filtered = filtered.filter((t) => t.date <= to);
    }

    return filtered.sort((a, b) => b.date - a.date);
  }, [state.transactions, filter]);

  const getTransactionsByAsset = useCallback(
    (assetUid: string) =>
      state.transactions
        .filter(
          (t) =>
            !t.isDel &&
            (t.assetUid === assetUid || t.toAssetUid === assetUid),
        )
        .sort((a, b) => b.date - a.date),
    [state.transactions],
  );

  function persist(next: Transaction[]) {
    storeTransactions(next);
  }

  function addIncomeExpense(txn: Transaction) {
    applyBalanceForTx(txn, updateAssetBalance);

    setState((prev) => {
      const next = [txn, ...prev.transactions];
      persist(next);
      return { ...prev, transactions: next };
    });
  }

  function addTransfer(
    fromAssetUid: string,
    toAssetUid: string,
    money: number,
    fee: number,
    content: string,
    date: number,
    currencyUid: string,
  ) {
    const now = Date.now();
    const transLinkUid = generateUid();

    const txOut: Transaction = {
      uid: generateUid(),
      assetUid: fromAssetUid,
      ctgUid: null,
      toAssetUid: toAssetUid,
      content,
      date,
      writeDate: null,
      doType: 3,
      money,
      inMoney: money,
      txUidTrans: transLinkUid,
      txUidFee: null,
      isDel: false,
      utime: now,
      currencyUid,
      amountAccount: money,
      mark: 0,
      paid: null,
      lat: null,
      lng: null,
    };

    const txIn: Transaction = {
      uid: transLinkUid,
      assetUid: toAssetUid,
      ctgUid: null,
      toAssetUid: fromAssetUid,
      content,
      date,
      writeDate: null,
      doType: 4,
      money,
      inMoney: money,
      txUidTrans: txOut.uid,
      txUidFee: null,
      isDel: false,
      utime: now,
      currencyUid,
      amountAccount: money,
      mark: 0,
      paid: null,
      lat: null,
      lng: null,
    };

    const newTxns: Transaction[] = [txOut, txIn];

    updateAssetBalance(fromAssetUid, -money);
    updateAssetBalance(toAssetUid, money);

    if (fee > 0) {
      const feeUid = generateUid();
      const txFee: Transaction = {
        uid: feeUid,
        assetUid: fromAssetUid,
        ctgUid: null,
        toAssetUid: null,
        content: `Transfer fee`,
        date,
        writeDate: null,
        doType: 1,
        money: fee,
        inMoney: fee,
        txUidTrans: null,
        txUidFee: null,
        isDel: false,
        utime: now,
        currencyUid,
        amountAccount: fee,
        mark: 0,
        paid: null,
        lat: null,
        lng: null,
      };

      txOut.txUidFee = feeUid;
      txIn.txUidFee = feeUid;
      newTxns.push(txFee);
      updateAssetBalance(fromAssetUid, -fee);
    }

    setState((prev) => {
      const next = [...newTxns, ...prev.transactions];
      persist(next);
      return { ...prev, transactions: next };
    });
  }

  function updateIncomeExpense(
    txnUid: string,
    updates: Partial<Omit<Transaction, "uid">>,
    original: Transaction,
  ) {
    reverseBalanceForTx(original, updateAssetBalance);

    setState((prev) => {
      const next = prev.transactions.map((t) => {
        if (t.uid !== txnUid) return t;
        const updated: Transaction = { ...t, ...updates, utime: Date.now() };
        applyBalanceForTx(updated, updateAssetBalance);
        return updated;
      });
      persist(next);
      return { ...prev, transactions: next };
    });
  }

  function deleteTransactionGroup(display: DisplayTransaction) {
    const uidsToDelete = new Set<string>();
    uidsToDelete.add(display.uid);

    if (display.pairedTx) {
      uidsToDelete.add(display.pairedTx.uid);
    }

    if (display.feeTx) {
      uidsToDelete.add(display.feeTx.uid);
    }

    setState((prev) => {
      for (const t of prev.transactions) {
        if (uidsToDelete.has(t.uid)) {
          reverseBalanceForTx(t, updateAssetBalance);
        }
      }

      const next = prev.transactions.filter((t) => !uidsToDelete.has(t.uid));
      persist(next);
      return { ...prev, transactions: next };
    });
  }

  return {
    transactions: state.transactions,
    displayTransactions,
    isLoading: state.isLoading,
    filter,
    setFilter,
    getTransactionsByAsset,
    addIncomeExpense,
    addTransfer,
    updateIncomeExpense,
    deleteTransactionGroup,
  };
}
