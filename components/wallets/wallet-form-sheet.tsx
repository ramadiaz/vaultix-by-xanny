"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  WalletColor,
  WalletCurrency,
  WalletType,
} from "@/features/wallets/types/wallet";
import {
  WALLET_COLOR_MAP,
  WALLET_COLOR_OPTIONS,
  WALLET_CURRENCY_OPTIONS,
  WALLET_TYPE_LABELS,
  WALLET_TYPE_OPTIONS,
} from "@/features/wallets/config/wallet-config";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type WalletFormSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  wallet?: Wallet | null;
  onSubmit: (wallet: Wallet) => void;
};

type WalletFormState = {
  name: string;
  type: WalletType;
  currency: WalletCurrency;
  color: WalletColor;
  balance: string;
};

function walletToFormState(wallet: Wallet): WalletFormState {
  return {
    name: wallet.name,
    type: wallet.type,
    currency: wallet.currency,
    color: wallet.color,
    balance: String(wallet.balance),
  };
}

const DEFAULT_FORM_STATE: WalletFormState = {
  name: "",
  type: "cash",
  currency: "IDR",
  color: "sky",
  balance: "",
};

export function WalletFormSheet({
  isOpen,
  onOpenChange,
  wallet,
  onSubmit,
}: WalletFormSheetProps) {
  const isEditing = !!wallet;

  const [formState, setFormState] = useState<WalletFormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (isOpen && wallet) {
      setFormState(walletToFormState(wallet));
    }

    if (isOpen && !wallet) {
      setFormState(DEFAULT_FORM_STATE);
    }
  }, [isOpen, wallet]);

  const isValid = useMemo(() => {
    if (!formState.name.trim()) {
      return false;
    }

    if (!isEditing && !formState.balance.trim()) {
      return false;
    }

    if (!isEditing) {
      const numericBalance = Number(formState.balance.replace(/[^0-9.-]/g, ""));

      if (Number.isNaN(numericBalance) || numericBalance < 0) {
        return false;
      }
    }

    return true;
  }, [formState.name, formState.balance, isEditing]);

  function handleFieldChange<Key extends keyof WalletFormState>(
    key: Key,
    value: WalletFormState[Key],
  ) {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    const now = new Date().toISOString();

    if (isEditing && wallet) {
      const updated: Wallet = {
        ...wallet,
        name: formState.name.trim(),
        type: formState.type,
        currency: formState.currency,
        color: formState.color,
        updatedAt: now,
      };

      onSubmit(updated);
    } else {
      const rawBalance = Number(formState.balance.replace(/[^0-9.-]/g, ""));

      const created: Wallet = {
        id: `wallet_${Date.now()}`,
        name: formState.name.trim(),
        type: formState.type,
        currency: formState.currency,
        color: formState.color,
        balance: rawBalance,
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      };

      onSubmit(created);
    }

    setFormState(DEFAULT_FORM_STATE);
    onOpenChange(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="mb-4 flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-soft">
            Wallet
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {isEditing ? "Edit wallet" : "Create new wallet"}
          </h2>
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
                {WALLET_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {WALLET_TYPE_LABELS[option]}
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
                {WALLET_CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {WALLET_COLOR_OPTIONS.map((colorKey) => {
                const colors = WALLET_COLOR_MAP[colorKey];
                const isSelected = formState.color === colorKey;

                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => handleFieldChange("color", colorKey)}
                    className={cn(
                      "h-7 w-7 rounded-full transition",
                      colors.bg,
                      isSelected && `ring-2 ${colors.ring} ring-offset-2 ring-offset-background`,
                    )}
                  />
                );
              })}
            </div>
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="wallet-balance">Starting balance</Label>
              <Input
                id="wallet-balance"
                type="tel"
                inputMode="numeric"
                value={formState.balance}
                onChange={(event) =>
                  handleFieldChange("balance", event.target.value)
                }
                placeholder="0"
              />
            </div>
          )}

          <Button type="submit" disabled={!isValid} className="mt-1 h-10">
            {isEditing ? "Save changes" : "Create wallet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
