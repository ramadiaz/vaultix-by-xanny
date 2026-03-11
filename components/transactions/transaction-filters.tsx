"use client";

import { TransactionKind } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";
import { TRANSACTION_KIND_LABELS } from "@/features/transactions/config/transaction-config";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type TransactionFilter = {
  walletId?: string;
  kind?: TransactionKind;
  search?: string;
  fromDate?: string;
  toDate?: string;
};

type TransactionFiltersProps = {
  filter: TransactionFilter;
  wallets: Wallet[];
  onFilterChange: (filter: TransactionFilter) => void;
};

const kindFilterOptions: (TransactionKind | "all")[] = [
  "all",
  "income",
  "expense",
  "transfer",
];

export function TransactionFilters({
  filter,
  wallets,
  onFilterChange,
}: TransactionFiltersProps) {
  function handleKindChange(kind: TransactionKind | "all") {
    onFilterChange({
      ...filter,
      kind: kind === "all" ? undefined : kind,
    });
  }

  function handleWalletChange(walletId: string) {
    onFilterChange({
      ...filter,
      walletId: walletId || undefined,
    });
  }

  function handleSearchChange(search: string) {
    onFilterChange({
      ...filter,
      search: search || undefined,
    });
  }

  function handleFromDateChange(fromDate: string) {
    onFilterChange({
      ...filter,
      fromDate: fromDate || undefined,
    });
  }

  function handleToDateChange(toDate: string) {
    onFilterChange({
      ...filter,
      toDate: toDate || undefined,
    });
  }

  const activeWallets = wallets.filter((w) => !w.isArchived);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="text"
        value={filter.search ?? ""}
        onChange={(event) => handleSearchChange(event.target.value)}
        placeholder="Search transactions"
        className="h-8 text-xs"
      />

      <div className="flex gap-1">
        {kindFilterOptions.map((kind) => {
          const isActive =
            kind === "all" ? !filter.kind : filter.kind === kind;

          return (
            <button
              key={kind}
              type="button"
              onClick={() => handleKindChange(kind)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {kind === "all" ? "All" : TRANSACTION_KIND_LABELS[kind]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filter.walletId ?? ""}
          onChange={(event) => handleWalletChange(event.target.value)}
          className="h-8 flex-1 rounded-xl border border-border-subtle bg-background-soft px-2 text-[11px] text-foreground outline-none focus:border-primary"
        >
          <option value="">All wallets</option>
          {activeWallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={filter.fromDate ?? ""}
          onChange={(event) => handleFromDateChange(event.target.value)}
          className="h-8 flex-1 text-[11px]"
        />

        <Input
          type="date"
          value={filter.toDate ?? ""}
          onChange={(event) => handleToDateChange(event.target.value)}
          className="h-8 flex-1 text-[11px]"
        />
      </div>
    </div>
  );
}
