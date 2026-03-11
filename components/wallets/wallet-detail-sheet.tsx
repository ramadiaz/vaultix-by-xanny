"use client";

import { FormEvent, useState } from "react";
import { Wallet, WalletBalanceAdjustment } from "@/features/wallets/types/wallet";
import { WALLET_COLOR_MAP, WALLET_TYPE_LABELS } from "@/features/wallets/config/wallet-config";
import { formatCurrency } from "@/features/wallets/utils/format-currency";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type WalletDetailSheetProps = {
  wallet: Wallet | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (wallet: Wallet) => void;
  onAdjustBalance: (adjustment: WalletBalanceAdjustment) => void;
  onArchive: (wallet: Wallet) => void;
  onRestore: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
};

type AdjustmentFormState = {
  amount: string;
  note: string;
  direction: "add" | "subtract";
};

const DEFAULT_ADJUSTMENT: AdjustmentFormState = {
  amount: "",
  note: "",
  direction: "add",
};

export function WalletDetailSheet({
  wallet,
  isOpen,
  onOpenChange,
  onEdit,
  onAdjustBalance,
  onArchive,
  onRestore,
  onDelete,
}: WalletDetailSheetProps) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState<AdjustmentFormState>(DEFAULT_ADJUSTMENT);

  if (!wallet) {
    return null;
  }

  const colors = WALLET_COLOR_MAP[wallet.color] ?? WALLET_COLOR_MAP.sky;

  function handleAdjustSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!wallet) {
      return;
    }

    const rawAmount = Number(adjustForm.amount.replace(/[^0-9.-]/g, ""));

    if (Number.isNaN(rawAmount) || rawAmount <= 0) {
      return;
    }

    const signedAmount = adjustForm.direction === "subtract" ? -rawAmount : rawAmount;

    onAdjustBalance({
      walletId: wallet.id,
      amount: signedAmount,
      note: adjustForm.note.trim(),
      adjustedAt: new Date().toISOString(),
    });

    setAdjustForm(DEFAULT_ADJUSTMENT);
    setShowAdjust(false);
  }

  const createdDate = new Date(wallet.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const updatedDate = new Date(wallet.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[85dvh] overflow-y-auto">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold uppercase",
              colors.bg,
              colors.text,
            )}
          >
            {wallet.name.slice(0, 2)}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">{wallet.name}</h2>
            <span className="text-[11px] text-muted-soft">
              {WALLET_TYPE_LABELS[wallet.type]} · {wallet.currency}
            </span>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-border-subtle bg-accent-soft/60 px-4 py-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
            Current Balance
          </span>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl bg-background-soft px-3 py-2">
            <span className="text-muted-soft">Created</span>
            <p className="mt-0.5 font-medium text-foreground">{createdDate}</p>
          </div>
          <div className="rounded-xl bg-background-soft px-3 py-2">
            <span className="text-muted-soft">Last updated</span>
            <p className="mt-0.5 font-medium text-foreground">{updatedDate}</p>
          </div>
        </div>

        {wallet.isArchived && (
          <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-[11px] font-medium text-warning">
            This wallet is archived. Restore it to resume tracking.
          </div>
        )}

        {!showAdjust ? (
          <div className="mb-4 flex flex-col gap-2">
            <Button
              type="button"
              variant="default"
              className="h-9"
              onClick={() => setShowAdjust(true)}
            >
              Adjust balance
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => {
                onOpenChange(false);
                onEdit(wallet);
              }}
            >
              Edit wallet
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {wallet.isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-success"
                  onClick={() => {
                    onRestore(wallet);
                    onOpenChange(false);
                  }}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-warning"
                  onClick={() => {
                    onArchive(wallet);
                    onOpenChange(false);
                  }}
                >
                  Archive
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-9 text-danger"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(wallet);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleAdjustSubmit}
            className="mb-4 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-background-soft p-3 text-xs"
          >
            <p className="text-[11px] font-semibold text-foreground">Balance adjustment</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setAdjustForm((previous) => ({ ...previous, direction: "add" }))
                }
                className={cn(
                  "rounded-xl px-3 py-2 text-center text-[11px] font-medium transition",
                  adjustForm.direction === "add"
                    ? "bg-success/15 text-success ring-1 ring-success/30"
                    : "bg-background text-muted hover:bg-accent-soft",
                )}
              >
                Add funds
              </button>
              <button
                type="button"
                onClick={() =>
                  setAdjustForm((previous) => ({ ...previous, direction: "subtract" }))
                }
                className={cn(
                  "rounded-xl px-3 py-2 text-center text-[11px] font-medium transition",
                  adjustForm.direction === "subtract"
                    ? "bg-danger/15 text-danger ring-1 ring-danger/30"
                    : "bg-background text-muted hover:bg-accent-soft",
                )}
              >
                Withdraw
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="adjust-amount">Amount</Label>
              <Input
                id="adjust-amount"
                type="tel"
                inputMode="numeric"
                value={adjustForm.amount}
                onChange={(event) =>
                  setAdjustForm((previous) => ({ ...previous, amount: event.target.value }))
                }
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="adjust-note">Note (optional)</Label>
              <Input
                id="adjust-note"
                type="text"
                value={adjustForm.note}
                onChange={(event) =>
                  setAdjustForm((previous) => ({ ...previous, note: event.target.value }))
                }
                placeholder="e.g. Correction, top-up"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowAdjust(false);
                  setAdjustForm(DEFAULT_ADJUSTMENT);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1">
                Apply
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
