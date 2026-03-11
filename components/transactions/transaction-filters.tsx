"use client";

import { DoType } from "@/features/transactions/types/transaction";
import { Asset } from "@/features/wallets/types/wallet";
import { DO_TYPE_LABELS } from "@/features/transactions/config/transaction-config";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type TransactionFilter = {
  assetUid?: string;
  doType?: DoType;
  search?: string;
  fromDate?: string;
  toDate?: string;
};

type TransactionFiltersProps = {
  filter: TransactionFilter;
  assets: Asset[];
  onFilterChange: (filter: TransactionFilter) => void;
};

const kindFilterOptions: ({ value: DoType | "all"; label: string })[] = [
  { value: "all", label: "All" },
  { value: 2, label: DO_TYPE_LABELS[2] },
  { value: 1, label: DO_TYPE_LABELS[1] },
  { value: 3, label: "Transfer" },
];

export function TransactionFilters({
  filter,
  assets,
  onFilterChange,
}: TransactionFiltersProps) {
  function handleKindChange(value: DoType | "all") {
    onFilterChange({
      ...filter,
      doType: value === "all" ? undefined : value,
    });
  }

  function handleAssetChange(assetUid: string) {
    onFilterChange({
      ...filter,
      assetUid: assetUid || undefined,
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

  const activeAssets = assets.filter((a) => !a.isArchived);

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
        {kindFilterOptions.map((opt) => {
          const isActive =
            opt.value === "all" ? filter.doType === undefined : filter.doType === opt.value;

          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleKindChange(opt.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filter.assetUid ?? ""}
          onChange={(event) => handleAssetChange(event.target.value)}
          className="h-8 flex-1 rounded-xl border border-glass-border bg-glass-bg px-2 text-[11px] text-foreground outline-none focus:border-primary"
        >
          <option value="">All wallets</option>
          {activeAssets.map((a) => (
            <option key={a.uid} value={a.uid}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
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
