 "use client";

import { FormEvent, useMemo, useState } from "react";
import { Transaction, TransactionKind } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type CreateTransactionSheetProps = {
  wallets: Wallet[];
  onSubmit: (transaction: Transaction) => void;
};

type TransactionFormState = {
  walletId: string;
  kind: TransactionKind;
  amount: string;
  description: string;
};

const kindOptions: TransactionKind[] = ["income", "expense"];

export function CreateTransactionSheet({
  wallets,
  onSubmit,
}: CreateTransactionSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<TransactionFormState>({
    walletId: "",
    kind: "expense",
    amount: "",
    description: "",
  });

  const isValid = useMemo(() => {
    if (!formState.walletId) {
      return false;
    }

    if (!formState.amount.trim()) {
      return false;
    }

    const numericAmount = Number(formState.amount.replace(/\D/g, ""));

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return false;
    }

    return true;
  }, [formState.walletId, formState.amount]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  }

  function handleFieldChange<Key extends keyof TransactionFormState>(
    key: Key,
    value: TransactionFormState[Key],
  ) {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const rawAmount = Number(formState.amount.replace(/\D/g, ""));
    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      walletId: formState.walletId,
      kind: formState.kind,
      amount: rawAmount,
      description: formState.description.trim(),
      occurredAt: now,
      createdAt: now,
    };

    onSubmit(transaction);

    setFormState({
      walletId: "",
      kind: "expense",
      amount: "",
      description: "",
    });
    setIsSubmitting(false);
    setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? handleOpen() : handleClose())}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="fixed bottom-20 left-4 z-20 shadow-lg shadow-black/40"
        >
          Add transaction
        </Button>
      </SheetTrigger>

      <SheetContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
              Activity
            </span>
            <h2 className="text-base font-semibold text-foreground">Add transaction</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <Label htmlFor="transaction-wallet">Wallet</Label>
            <select
              id="transaction-wallet"
              value={formState.walletId}
              onChange={(event) => handleFieldChange("walletId", event.target.value)}
              className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Select wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="transaction-kind">Type</Label>
              <select
                id="transaction-kind"
                value={formState.kind}
                onChange={(event) =>
                  handleFieldChange("kind", event.target.value as TransactionKind)
                }
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {kindOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="transaction-amount">Amount</Label>
              <Input
                id="transaction-amount"
                type="tel"
                inputMode="numeric"
                value={formState.amount}
                onChange={(event) => handleFieldChange("amount", event.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="transaction-description">Description</Label>
            <Input
              id="transaction-description"
              type="text"
              value={formState.description}
              onChange={(event) =>
                handleFieldChange("description", event.target.value)
              }
              placeholder="e.g. Coffee, salary, groceries"
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-1 h-10"
          >
            Save transaction
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

