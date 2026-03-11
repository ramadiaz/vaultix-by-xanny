"use client";

import { FormEvent, useState } from "react";
import { Asset, BalanceAdjustment } from "@/features/wallets/types/wallet";
import { ASSET_COLOR_MAP } from "@/features/wallets/config/wallet-config";
import { formatCurrencyByIso } from "@/features/wallets/utils/format-currency";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type WalletDetailSheetProps = {
  asset: Asset | null;
  groupLabel: string;
  currencyIso: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (asset: Asset) => void;
  onAdjustBalance: (adjustment: BalanceAdjustment) => void;
  onSetFinalBalance: (asset: Asset, targetBalance: number) => void;
  onArchive: (asset: Asset) => void;
  onRestore: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

type AdjustmentFormState = {
  amount: string;
  note: string;
  direction: "add" | "subtract";
};

type FinalBalanceFormState = {
  targetBalance: string;
};

const DEFAULT_ADJUSTMENT: AdjustmentFormState = {
  amount: "",
  note: "",
  direction: "add",
};

const DEFAULT_FINAL_BALANCE: FinalBalanceFormState = {
  targetBalance: "",
};

export function WalletDetailSheet({
  asset,
  groupLabel,
  currencyIso,
  isOpen,
  onOpenChange,
  onEdit,
  onAdjustBalance,
  onSetFinalBalance,
  onArchive,
  onRestore,
  onDelete,
}: WalletDetailSheetProps) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustMode, setAdjustMode] = useState<"amount" | "final">("amount");
  const [adjustForm, setAdjustForm] = useState<AdjustmentFormState>(DEFAULT_ADJUSTMENT);
  const [finalBalanceForm, setFinalBalanceForm] =
    useState<FinalBalanceFormState>(DEFAULT_FINAL_BALANCE);

  if (!asset) return null;

  const colors = ASSET_COLOR_MAP[asset.color] ?? ASSET_COLOR_MAP.sky;

  function handleAdjustSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!asset) return;

    const rawAmount = Number(adjustForm.amount.replace(/[^0-9.-]/g, ""));

    if (Number.isNaN(rawAmount) || rawAmount <= 0) return;

    const signedAmount = adjustForm.direction === "subtract" ? -rawAmount : rawAmount;

    onAdjustBalance({
      assetUid: asset.uid,
      amount: signedAmount,
      note: adjustForm.note.trim(),
      adjustedAt: Date.now(),
    });

    setAdjustForm(DEFAULT_ADJUSTMENT);
    setShowAdjust(false);
  }

  function handleSetFinalBalanceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!asset) return;

    const rawTarget = Number(finalBalanceForm.targetBalance.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(rawTarget) || rawTarget < 0) return;

    const delta = rawTarget - asset.balance;
    if (delta === 0) {
      setFinalBalanceForm(DEFAULT_FINAL_BALANCE);
      setShowAdjust(false);
      return;
    }

    onSetFinalBalance(asset, rawTarget);
    setFinalBalanceForm(DEFAULT_FINAL_BALANCE);
    setShowAdjust(false);
  }

  const updatedDate = new Date(asset.utime).toLocaleDateString("en-US", {
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
            {asset.name.slice(0, 2)}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold text-foreground">{asset.name}</h2>
            <span className="text-[11px] text-muted-soft">
              {groupLabel} · {currencyIso}
            </span>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-border-subtle bg-accent-soft/60 px-4 py-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-soft">
            Current Balance
          </span>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            {formatCurrencyByIso(asset.balance, currencyIso)}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2 text-[11px]">
          <div className="rounded-xl bg-background-soft px-3 py-2">
            <span className="text-muted-soft">Last updated</span>
            <p className="mt-0.5 font-medium text-foreground">{updatedDate}</p>
          </div>
        </div>

        {asset.isArchived && (
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
              onClick={() => {
                setAdjustMode("amount");
                setShowAdjust(true);
              }}
            >
              Adjust balance
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => {
                setAdjustMode("final");
                setFinalBalanceForm({
                  targetBalance: String(asset.balance),
                });
                setShowAdjust(true);
              }}
            >
              Set final balance
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-9"
              onClick={() => {
                onOpenChange(false);
                onEdit(asset);
              }}
            >
              Edit wallet
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {asset.isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-success"
                  onClick={() => {
                    onRestore(asset);
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
                    onArchive(asset);
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
                  onDelete(asset);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : adjustMode === "final" ? (
          <form
            onSubmit={handleSetFinalBalanceSubmit}
            className="mb-4 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-background-soft p-3 text-xs"
          >
            <p className="text-[11px] font-semibold text-foreground">Set final balance</p>
            <p className="text-[10px] text-muted-soft">
              Enter the target balance. A transaction will be created automatically based on the
              difference.
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="target-balance">Target balance</Label>
              <Input
                id="target-balance"
                type="tel"
                inputMode="numeric"
                value={finalBalanceForm.targetBalance}
                onChange={(event) =>
                  setFinalBalanceForm((prev) => ({
                    ...prev,
                    targetBalance: event.target.value,
                  }))
                }
                placeholder="0"
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
                  setFinalBalanceForm(DEFAULT_FINAL_BALANCE);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1"
                disabled={(() => {
                  const raw = Number(
                    finalBalanceForm.targetBalance.replace(/[^0-9.-]/g, ""),
                  );
                  return (
                    !finalBalanceForm.targetBalance.trim() ||
                    Number.isNaN(raw) ||
                    raw < 0 ||
                    raw === asset.balance
                  );
                })()}
              >
                Apply
              </Button>
            </div>
          </form>
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
                  setAdjustForm((prev) => ({ ...prev, direction: "add" }))
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
                  setAdjustForm((prev) => ({ ...prev, direction: "subtract" }))
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
                  setAdjustForm((prev) => ({ ...prev, amount: event.target.value }))
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
                  setAdjustForm((prev) => ({ ...prev, note: event.target.value }))
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
