 "use client";

import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { CreateTransactionSheet } from "@/components/transactions/create-transaction-sheet";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useWallets } from "@/features/wallets/hooks/use-wallets";

export default function TransactionsPage() {
  const { wallets, isLoading: isWalletsLoading } = useWallets();
  const { transactions, isLoading: isTransactionsLoading, addTransaction } =
    useTransactions();

  const isLoading = isWalletsLoading || isTransactionsLoading;

  return (
    <AuthGate>
      <MobileShell title="Transactions" activeTab="transactions">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted">
            Loading your activity
          </div>
        ) : (
          <TransactionList transactions={transactions} />
        )}
        <CreateTransactionSheet wallets={wallets} onSubmit={addTransaction} />
      </MobileShell>
    </AuthGate>
  );
}

