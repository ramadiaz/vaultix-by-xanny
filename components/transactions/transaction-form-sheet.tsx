"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Transaction,
  TransactionCategory,
  TransactionKind,
} from "@/features/transactions/types/transaction";
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  getCategoriesForKind,
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KIND_OPTIONS,
} from "@/features/transactions/config/transaction-config";
import { Wallet } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type TransactionFormSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: Wallet[];
  transaction?: Transaction | null;
  onSubmit: (transaction: Transaction) => void;
  onUpdate?: (
    transactionId: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>,
    original: Transaction,
  ) => void;
};

type TransactionFormState = {
  walletId: string;
  targetWalletId: string;
  kind: TransactionKind;
  category: TransactionCategory;
  amount: string;
  description: string;
  note: string;
  occurredAt: string;
};

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

const DEFAULT_FORM: TransactionFormState = {
  walletId: "",
  targetWalletId: "",
  kind: "expense",
  category: "food",
  amount: "",
  description: "",
  note: "",
  occurredAt: todayDateString(),
};

function transactionToForm(txn: Transaction): TransactionFormState {
  return {
    walletId: txn.walletId,
    targetWalletId: txn.targetWalletId ?? "",
    kind: txn.kind,
    category: txn.category,
    amount: String(txn.amount),
    description: txn.description,
    note: txn.note,
    occurredAt: txn.occurredAt.split("T")[0],
  };
}

export function TransactionFormSheet({
  isOpen,
  onOpenChange,
  wallets,
  transaction,
  onSubmit,
  onUpdate,
}: TransactionFormSheetProps) {
  const isEditing = !!transaction;

  const [formState, setFormState] = useState<TransactionFormState>(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen && transaction) {
      setFormState(transactionToForm(transaction));
    }

    if (isOpen && !transaction) {
      setFormState({ ...DEFAULT_FORM, occurredAt: todayDateString() });
    }
  }, [isOpen, transaction]);

  const categoryOptions = useMemo(
    () => getCategoriesForKind(formState.kind),
    [formState.kind],
  );

  const isValid = useMemo(() => {
    if (!formState.walletId) {
      return false;
    }

    if (formState.kind === "transfer" && !formState.targetWalletId) {
      return false;
    }

    if (
      formState.kind === "transfer" &&
      formState.walletId === formState.targetWalletId
    ) {
      return false;
    }

    const numericAmount = Number(formState.amount.replace(/[^0-9.-]/g, ""));

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return false;
    }

    if (!formState.occurredAt) {
      return false;
    }

    return true;
  }, [
    formState.walletId,
    formState.targetWalletId,
    formState.kind,
    formState.amount,
    formState.occurredAt,
  ]);

  function handleFieldChange<Key extends keyof TransactionFormState>(
    key: Key,
    value: TransactionFormState[Key],
  ) {
    setFormState((previous) => {
      const next = { ...previous, [key]: value };

      if (key === "kind") {
        const nextCategories = getCategoriesForKind(value as TransactionKind);
        if (!nextCategories.includes(next.category)) {
          next.category = nextCategories[0];
        }

        if ((value as TransactionKind) !== "transfer") {
          next.targetWalletId = "";
        }
      }

      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    const rawAmount = Number(formState.amount.replace(/[^0-9.-]/g, ""));
    const now = new Date().toISOString();
    const occurredAtISO = new Date(formState.occurredAt).toISOString();

    if (isEditing && transaction && onUpdate) {
      onUpdate(
        transaction.id,
        {
          walletId: formState.walletId,
          targetWalletId: formState.targetWalletId || null,
          kind: formState.kind,
          category: formState.category,
          amount: rawAmount,
          description: formState.description.trim(),
          note: formState.note.trim(),
          occurredAt: occurredAtISO,
        },
        transaction,
      );
    } else {
      const created: Transaction = {
        id: `txn_${Date.now()}`,
        walletId: formState.walletId,
        targetWalletId: formState.targetWalletId || null,
        kind: formState.kind,
        category: formState.category,
        amount: rawAmount,
        description: formState.description.trim(),
        note: formState.note.trim(),
        occurredAt: occurredAtISO,
        createdAt: now,
        updatedAt: now,
      };

      onSubmit(created);
    }

    setFormState({ ...DEFAULT_FORM, occurredAt: todayDateString() });
    onOpenChange(false);
  }

  const activeWallets = wallets.filter((w) => !w.isArchived);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90dvh] overflow-y-auto">
        <div className="mb-4 flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Transaction
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {isEditing ? "Edit transaction" : "New transaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="flex gap-1 rounded-xl bg-background-soft p-1">
            {TRANSACTION_KIND_OPTIONS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => handleFieldChange("kind", kind)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-medium transition",
                  formState.kind === kind
                    ? kind === "income"
                      ? "bg-success/15 text-success"
                      : kind === "expense"
                        ? "bg-danger/15 text-danger"
                        : "bg-primary/15 text-primary"
                    : "text-muted hover:text-foreground",
                )}
              >
                {TRANSACTION_KIND_LABELS[kind]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="txn-wallet">
              {formState.kind === "transfer" ? "From wallet" : "Wallet"}
            </Label>
            <select
              id="txn-wallet"
              value={formState.walletId}
              onChange={(event) =>
                handleFieldChange("walletId", event.target.value)
              }
              className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Select wallet</option>
              {activeWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          {formState.kind === "transfer" && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-target-wallet">To wallet</Label>
              <select
                id="txn-target-wallet"
                value={formState.targetWalletId}
                onChange={(event) =>
                  handleFieldChange("targetWalletId", event.target.value)
                }
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Select wallet</option>
                {activeWallets
                  .filter((wallet) => wallet.id !== formState.walletId)
                  .map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-amount">Amount</Label>
              <Input
                id="txn-amount"
                type="tel"
                inputMode="numeric"
                value={formState.amount}
                onChange={(event) =>
                  handleFieldChange("amount", event.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-date">Date</Label>
              <Input
                id="txn-date"
                type="date"
                value={formState.occurredAt}
                onChange={(event) =>
                  handleFieldChange("occurredAt", event.target.value)
                }
              />
            </div>
          </div>

          {formState.kind !== "transfer" && (
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleFieldChange("category", cat)}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-[11px] font-medium transition",
                      formState.category === cat
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : "bg-background-soft text-muted hover:text-foreground",
                    )}
                  >
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="txn-description">Description</Label>
            <Input
              id="txn-description"
              type="text"
              value={formState.description}
              onChange={(event) =>
                handleFieldChange("description", event.target.value)
              }
              placeholder="e.g. Coffee, salary, groceries"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="txn-note">Note (optional)</Label>
            <Input
              id="txn-note"
              type="text"
              value={formState.note}
              onChange={(event) =>
                handleFieldChange("note", event.target.value)
              }
              placeholder="Any extra details"
            />
          </div>

          <Button type="submit" disabled={!isValid} className="mt-1 h-10">
            {isEditing ? "Save changes" : "Add transaction"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
