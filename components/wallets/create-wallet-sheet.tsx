 "use client";

import { FormEvent, useMemo, useState } from "react";
import { Wallet, WalletCurrency, WalletType } from "@/features/wallets/types/wallet";

type CreateWalletSheetProps = {
  onSubmit: (wallet: Wallet) => void;
};

type WalletFormState = {
  name: string;
  type: WalletType;
  currency: WalletCurrency;
  balance: string;
};

const typeOptions: WalletType[] = ["cash", "bank", "card", "investment", "other"];

const currencyOptions: WalletCurrency[] = ["IDR", "USD", "EUR", "SGD", "OTHER"];

export function CreateWalletSheet({ onSubmit }: CreateWalletSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<WalletFormState>({
    name: "",
    type: "cash",
    currency: "IDR",
    balance: "",
  });

  const isValid = useMemo(() => {
    if (!formState.name.trim()) {
      return false;
    }

    if (!formState.balance.trim()) {
      return false;
    }

    const numericBalance = Number(formState.balance.replace(/\D/g, ""));

    if (Number.isNaN(numericBalance)) {
      return false;
    }

    if (numericBalance < 0) {
      return false;
    }

    return true;
  }, [formState.name, formState.balance]);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  }

  function handleFieldChange<Key extends keyof WalletFormState>(
    key: Key,
    value: WalletFormState[Key],
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

    const rawBalance = Number(formState.balance.replace(/\D/g, ""));
    const now = new Date().toISOString();

    const wallet: Wallet = {
      id: `wallet_${Date.now()}`,
      name: formState.name.trim(),
      type: formState.type,
      currency: formState.currency,
      balance: rawBalance,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    onSubmit(wallet);

    setFormState({
      name: "",
      type: "cash",
      currency: "IDR",
      balance: "",
    });
    setIsSubmitting(false);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-20 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-background shadow-lg shadow-black/40 active:scale-[0.97]"
      >
        Add wallet
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl bg-background px-5 pb-5 pt-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
                  Wallet
                </span>
                <h2 className="text-base font-semibold text-foreground">
                  Create new wallet
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
                <span className="font-medium text-muted-soft">Wallet name</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="e.g. Main wallet"
                  className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-medium text-muted-soft">Type</span>
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      handleFieldChange("type", event.target.value as WalletType)
                    }
                    className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-medium text-muted-soft">Currency</span>
                  <select
                    value={formState.currency}
                    onChange={(event) =>
                      handleFieldChange(
                        "currency",
                        event.target.value as WalletCurrency,
                      )
                    }
                    className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {currencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-medium text-muted-soft">Starting balance</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formState.balance}
                  onChange={(event) => handleFieldChange("balance", event.target.value)}
                  placeholder="0"
                  className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none ring-0 focus:border-primary"
                />
              </label>

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="mt-1 flex h-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-background disabled:opacity-60"
              >
                Create wallet
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

