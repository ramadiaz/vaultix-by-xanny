"use client";

import { Transaction } from "@/features/transactions/types/transaction";
import { CATEGORY_LABELS } from "@/features/transactions/config/transaction-config";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type DeleteTransactionDialogProps = {
  transaction: Transaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (transaction: Transaction) => void;
};

export function DeleteTransactionDialog({
  transaction,
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteTransactionDialogProps) {
  if (!transaction) {
    return null;
  }

  function handleConfirm() {
    if (!transaction) {
      return;
    }

    onConfirm(transaction);
    onOpenChange(false);
  }

  const label =
    transaction.description ||
    CATEGORY_LABELS[transaction.category] ||
    "this transaction";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              Delete transaction
            </h2>
            <p className="text-[12px] leading-relaxed text-muted">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{label}</span>?
              The wallet balance will be reverted automatically.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 h-9"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 h-9 bg-danger text-white hover:bg-danger/90"
              onClick={handleConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
