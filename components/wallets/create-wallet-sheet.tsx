 "use client";

import { FormEvent, useMemo, useState } from "react";
import { Wallet, WalletCurrency, WalletType } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    <Sheet open={isOpen} onOpenChange={(open) => (open ? handleOpen() : handleClose())}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="lg"
          className="fixed bottom-20 right-4 z-20 shadow-lg shadow-black/40"
        >
          Add wallet
        </Button>
      </SheetTrigger>

      <SheetContent>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
              Wallet
            </span>
            <h2 className="text-base font-semibold text-foreground">Create new wallet</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <Label htmlFor="wallet-name">Wallet name</Label>
            <Input
              id="wallet-name"
              type="text"
              value={formState.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              placeholder="e.g. Main wallet"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="wallet-type">Type</Label>
              <select
                id="wallet-type"
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
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="wallet-currency">Currency</Label>
              <select
                id="wallet-currency"
                value={formState.currency}
                onChange={(event) =>
                  handleFieldChange("currency", event.target.value as WalletCurrency)
                }
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="wallet-balance">Starting balance</Label>
            <Input
              id="wallet-balance"
              type="tel"
              inputMode="numeric"
              value={formState.balance}
              onChange={(event) => handleFieldChange("balance", event.target.value)}
              placeholder="0"
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-1 h-10"
          >
            Create wallet
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

