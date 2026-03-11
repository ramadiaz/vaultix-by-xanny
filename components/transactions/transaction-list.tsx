"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Category } from "@/features/transactions/types/transaction";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { Asset } from "@/features/wallets/types/wallet";
import { groupTransactionsByDate } from "@/features/transactions/utils/group-transactions-by-date";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";
import { TransactionCard } from "./transaction-card";

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

const groupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.01 },
  },
};

type TransactionListProps = {
  transactions: DisplayTransaction[];
  assets: Asset[];
  categories: Category[];
  getCurrencyIso: (uid: string) => string;
  onEdit: (transaction: DisplayTransaction) => void;
  onDelete: (transaction: DisplayTransaction) => void;
};

export function TransactionList({
  transactions,
  assets,
  categories,
  getCurrencyIso,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const shouldReduceMotion = useReducedMotion();
  const itemVariantsResolved = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : itemVariants;
  const groupVariantsResolved = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : groupVariants;

  const assetMap = useMemo(() => {
    const map = new Map<string, Asset>();
    for (const a of assets) {
      map.set(a.uid, a);
    }
    return map;
  }, [assets]);

  const dateGroups = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions],
  );

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-glass-border bg-glass-bg px-4 py-8 text-center text-xs">
        <p className="font-medium text-foreground">No transactions found</p>
        <p className="mt-1 text-[11px] text-muted">
          Add your income and expenses or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {dateGroups.map((group) => (
        <motion.section
          key={group.dateKey}
          className="flex flex-col gap-2"
          variants={groupVariantsResolved}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-foreground">
              {group.label}
            </span>
            <div className="flex gap-2 text-[10px] font-medium">
              {group.income > 0 && (
                <span className="text-success">
                  +{formatCurrencyByIso(group.income, "IDR")}
                </span>
              )}
              {group.expense > 0 && (
                <span className="text-danger">
                  -{formatCurrencyByIso(group.expense, "IDR")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {group.transactions.map((txn) => {
              const displayTxn = txn as DisplayTransaction;
              const sourceAsset = assetMap.get(txn.assetUid);
              const targetAsset = txn.toAssetUid
                ? assetMap.get(txn.toAssetUid)
                : displayTxn.pairedTx
                  ? assetMap.get(displayTxn.pairedTx.assetUid)
                  : undefined;

              return (
                <motion.div key={txn.uid} variants={itemVariantsResolved}>
                  <TransactionCard
                    transaction={displayTxn}
                    asset={sourceAsset}
                    targetAsset={targetAsset}
                    categories={categories}
                    getCurrencyIso={getCurrencyIso}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
