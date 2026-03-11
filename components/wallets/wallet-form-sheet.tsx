"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Asset, AssetGroupType, Currency } from "@/features/wallets/types/wallet";
import {
  ASSET_COLOR_MAP,
  ASSET_COLOR_OPTIONS,
  ASSET_GROUP_LABELS,
  ASSET_GROUP_OPTIONS,
} from "@/features/wallets/config/wallet-config";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type WalletFormSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  currencies: Currency[];
  onSubmit: (asset: Asset) => void;
};

type FormState = {
  name: string;
  groupUid: string;
  currencyUid: string;
  color: string;
  balance: string;
};

function assetToFormState(asset: Asset): FormState {
  return {
    name: asset.name,
    groupUid: asset.groupUid,
    currencyUid: asset.currencyUid,
    color: asset.color,
    balance: String(asset.balance),
  };
}

const DEFAULT_FORM: FormState = {
  name: "",
  groupUid: "11",
  currencyUid: "IDR_IDR",
  color: "sky",
  balance: "",
};

export function WalletFormSheet({
  isOpen,
  onOpenChange,
  asset,
  currencies,
  onSubmit,
}: WalletFormSheetProps) {
  const isEditing = !!asset;

  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen && asset) {
      setFormState(assetToFormState(asset));
    }

    if (isOpen && !asset) {
      setFormState(DEFAULT_FORM);
    }
  }, [isOpen, asset]);

  const isValid = useMemo(() => {
    if (!formState.name.trim()) return false;

    if (!isEditing && !formState.balance.trim()) return false;

    if (!isEditing) {
      const numericBalance = Number(formState.balance.replace(/[^0-9.-]/g, ""));
      if (Number.isNaN(numericBalance) || numericBalance < 0) return false;
    }

    return true;
  }, [formState.name, formState.balance, isEditing]);

  function handleFieldChange<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) return;

    const now = Date.now();

    if (isEditing && asset) {
      const updated: Asset = {
        ...asset,
        name: formState.name.trim(),
        groupUid: formState.groupUid,
        currencyUid: formState.currencyUid,
        color: formState.color,
        utime: now,
      };

      onSubmit(updated);
    } else {
      const rawBalance = Number(formState.balance.replace(/[^0-9.-]/g, ""));

      const created: Asset = {
        uid: `asset_${now}`,
        name: formState.name.trim(),
        groupUid: formState.groupUid,
        currencyUid: formState.currencyUid,
        orderSeq: 0,
        balance: rawBalance,
        isArchived: false,
        color: formState.color,
        cardDayFin: null,
        cardDayPay: null,
        isTransExpense: false,
        isCardAutoPay: false,
        utime: now,
      };

      onSubmit(created);
    }

    setFormState(DEFAULT_FORM);
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
              <Label htmlFor="wallet-group">Type</Label>
              <select
                id="wallet-group"
                value={formState.groupUid}
                onChange={(event) =>
                  handleFieldChange("groupUid", event.target.value)
                }
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {ASSET_GROUP_OPTIONS.map((type) => (
                  <option key={type} value={String(type)}>
                    {ASSET_GROUP_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="wallet-currency">Currency</Label>
              <select
                id="wallet-currency"
                value={formState.currencyUid}
                onChange={(event) =>
                  handleFieldChange("currencyUid", event.target.value)
                }
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {currencies.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.iso} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {ASSET_COLOR_OPTIONS.map((colorKey) => {
                const colors = ASSET_COLOR_MAP[colorKey];
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
