 "use client";

import { FormEvent, useMemo, useState } from "react";
import { Transaction, TransactionKind } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";

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
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-20 left-4 z-20 inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-foreground shadow-lg shadow-black/40 active:scale-[0.97]"
      >
        Add transaction
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl bg-background px-5 pb-5 pt-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
                  Activity
                </span>
                <h2 className="text-base font-semibold text-foreground">
                  Add transaction
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-2 py-1 text-xs text-muted hover:bg-accent-soft"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-muted-soft">Wallet</span>
                <select
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
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-muted-soft">Type</span>
                  <select
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
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-medium text-muted-soft">Amount</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formState.amount}
                    onChange={(event) =>
                      handleFieldChange("amount", event.target.value)
                    }
                    placeholder="0"
                    className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-muted-soft">Description</span>
                <input
                  type="text"
                  value={formState.description}
                  onChange={(event) =>
                    handleFieldChange("description", event.target.value)
                  }
                  placeholder="e.g. Coffee, salary, groceries"
                  className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
                />
              </label>

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="mt-1 flex h-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-background disabled:opacity-60"
              >
                Save transaction
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

