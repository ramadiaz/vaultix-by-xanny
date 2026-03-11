"use client";

import { Category } from "@/features/transactions/types/transaction";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import { CategoryBreakdownItem } from "@/features/stats/utils/stats-utils";
import { Asset } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TransactionList } from "@/components/transactions/transaction-list";

type CategoryTransactionsSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryItem: CategoryBreakdownItem | null;
  doType: 1 | 2;
  transactions: DisplayTransaction[];
  assets: Asset[];
  categories: Category[];
  getCurrencyIso: (uid: string) => string;
};

export function CategoryTransactionsSheet({
  isOpen,
  onOpenChange,
  categoryItem,
  doType,
  transactions,
  assets,
  categories,
  getCurrencyIso,
}: CategoryTransactionsSheetProps) {
  const title =
    categoryItem != null
      ? `${categoryItem.icon} ${categoryItem.name}`
      : doType === 1
        ? "Expense"
        : "Income";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90dvh] flex flex-col">
        <div className="mb-4 flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Transactions by category
          </span>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TransactionList
            transactions={transactions}
            assets={assets}
            categories={categories}
            getCurrencyIso={getCurrencyIso}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
