"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Category, DoType } from "@/features/transactions/types/transaction";
import { DisplayTransaction } from "@/features/transactions/hooks/use-transactions";
import {
  getCategoriesForDoType,
  getCategoryDisplayName,
  getCategoryIcon,
  KIND_OPTIONS,
} from "@/features/transactions/config/transaction-config";
import { Asset } from "@/features/wallets/types/wallet";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type TransactionFormSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  categories: Category[];
  transaction?: DisplayTransaction | null;
  onSubmitIncomeExpense: (txn: {
    assetUid: string;
    ctgUid: string;
    doType: DoType;
    money: number;
    content: string;
    date: number;
    currencyUid: string;
  }) => void;
  onSubmitTransfer: (params: {
    fromAssetUid: string;
    toAssetUid: string;
    money: number;
    fee: number;
    content: string;
    date: number;
    currencyUid: string;
  }) => void;
  onUpdateIncomeExpense?: (
    txnUid: string,
    updates: Record<string, unknown>,
    original: DisplayTransaction,
  ) => void;
  onAddCategory?: (category: Category) => void;
};

type FormState = {
  assetUid: string;
  toAssetUid: string;
  doType: DoType;
  ctgUid: string;
  amount: string;
  fee: string;
  content: string;
  date: string;
};

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

const DEFAULT_FORM: FormState = {
  assetUid: "",
  toAssetUid: "",
  doType: 1,
  ctgUid: "6",
  amount: "",
  fee: "",
  content: "",
  date: todayDateString(),
};

function txnToForm(txn: DisplayTransaction): FormState {
  return {
    assetUid: txn.assetUid,
    toAssetUid: txn.toAssetUid ?? txn.pairedTx?.assetUid ?? "",
    doType: txn.doType === 4 ? 3 : txn.doType,
    ctgUid: txn.ctgUid ?? "",
    amount: String(txn.money),
    fee: txn.feeTx ? String(txn.feeTx.money) : "",
    content: txn.content ?? "",
    date: new Date(txn.date).toISOString().split("T")[0],
  };
}

type NewCategoryFormState = {
  name: string;
  icon: string;
};

export function TransactionFormSheet({
  isOpen,
  onOpenChange,
  assets,
  categories,
  transaction,
  onSubmitIncomeExpense,
  onSubmitTransfer,
  onUpdateIncomeExpense,
  onAddCategory,
}: TransactionFormSheetProps) {
  const isEditing = !!transaction;

  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState<NewCategoryFormState>({
    name: "",
    icon: "📌",
  });

  useEffect(() => {
    if (isOpen && transaction) {
      setFormState(txnToForm(transaction));
    }

    if (isOpen && !transaction) {
      setFormState({ ...DEFAULT_FORM, date: todayDateString() });
    }

    setShowNewCategory(false);
  }, [isOpen, transaction]);

  const isTransfer = formState.doType === 3;

  const categoryOptions = useMemo(
    () => getCategoriesForDoType(formState.doType, categories),
    [formState.doType, categories],
  );

  const isValid = useMemo(() => {
    if (!formState.assetUid) return false;
    if (isTransfer && !formState.toAssetUid) return false;
    if (isTransfer && formState.assetUid === formState.toAssetUid) return false;

    const numericAmount = Number(formState.amount.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return false;
    if (!formState.date) return false;

    return true;
  }, [formState.assetUid, formState.toAssetUid, formState.doType, formState.amount, formState.date, isTransfer]);

  function handleFieldChange<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setFormState((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "doType") {
        const cats = getCategoriesForDoType(value as DoType, categories);
        if (cats.length > 0 && !cats.find((c) => c.uid === next.ctgUid)) {
          next.ctgUid = cats[0].uid;
        }

        if ((value as DoType) !== 3) {
          next.toAssetUid = "";
          next.fee = "";
        }
      }

      return next;
    });
  }

  function handleAddCustomCategory() {
    if (!newCategoryForm.name.trim() || !onAddCategory) return;

    const catType = formState.doType === 2 ? 0 : 1;

    const newCategory: Category = {
      uid: `cat_${Date.now()}`,
      name: `${newCategoryForm.icon} ${newCategoryForm.name.trim()}`,
      type: catType as 0 | 1,
      status: 0,
      pUid: null,
      orderSeq: 99,
      isDel: false,
      utime: Date.now(),
    };

    onAddCategory(newCategory);
    setFormState((prev) => ({ ...prev, ctgUid: newCategory.uid }));
    setNewCategoryForm({ name: "", icon: "📌" });
    setShowNewCategory(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) return;

    const rawAmount = Number(formState.amount.replace(/[^0-9.-]/g, ""));
    const rawFee = formState.fee ? Number(formState.fee.replace(/[^0-9.-]/g, "")) : 0;
    const dateMs = new Date(formState.date).getTime();

    const selectedAsset = assets.find((a) => a.uid === formState.assetUid);
    const currencyUid = selectedAsset?.currencyUid ?? "IDR_IDR";

    if (isTransfer) {
      onSubmitTransfer({
        fromAssetUid: formState.assetUid,
        toAssetUid: formState.toAssetUid,
        money: rawAmount,
        fee: rawFee,
        content: formState.content.trim(),
        date: dateMs,
        currencyUid,
      });
    } else if (isEditing && transaction && onUpdateIncomeExpense) {
      onUpdateIncomeExpense(
        transaction.uid,
        {
          assetUid: formState.assetUid,
          ctgUid: formState.ctgUid || null,
          doType: formState.doType,
          money: rawAmount,
          inMoney: rawAmount,
          amountAccount: rawAmount,
          content: formState.content.trim(),
          date: dateMs,
          currencyUid,
        },
        transaction,
      );
    } else {
      onSubmitIncomeExpense({
        assetUid: formState.assetUid,
        ctgUid: formState.ctgUid,
        doType: formState.doType,
        money: rawAmount,
        content: formState.content.trim(),
        date: dateMs,
        currencyUid,
      });
    }

    setFormState({ ...DEFAULT_FORM, date: todayDateString() });
    onOpenChange(false);
  }

  const activeAssets = assets.filter((a) => !a.isArchived);

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
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFieldChange("doType", opt.value)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-medium transition",
                  formState.doType === opt.value
                    ? opt.value === 2
                      ? "bg-success/15 text-success"
                      : opt.value === 1
                        ? "bg-danger/15 text-danger"
                        : "bg-primary/15 text-primary"
                    : "text-muted hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="txn-wallet">
              {isTransfer ? "From wallet" : "Wallet"}
            </Label>
            <select
              id="txn-wallet"
              value={formState.assetUid}
              onChange={(event) => handleFieldChange("assetUid", event.target.value)}
              className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Select wallet</option>
              {activeAssets.map((a) => (
                <option key={a.uid} value={a.uid}>{a.name}</option>
              ))}
            </select>
          </div>

          {isTransfer && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-target-wallet">To wallet</Label>
              <select
                id="txn-target-wallet"
                value={formState.toAssetUid}
                onChange={(event) => handleFieldChange("toAssetUid", event.target.value)}
                className="h-9 rounded-2xl border border-border-subtle bg-background-soft px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Select wallet</option>
                {activeAssets
                  .filter((a) => a.uid !== formState.assetUid)
                  .map((a) => (
                    <option key={a.uid} value={a.uid}>{a.name}</option>
                  ))}
              </select>
            </div>
          )}

          <div className={cn("grid gap-3", isTransfer ? "grid-cols-3" : "grid-cols-2")}>
            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-amount">Amount</Label>
              <Input
                id="txn-amount"
                type="tel"
                inputMode="numeric"
                value={formState.amount}
                onChange={(event) => handleFieldChange("amount", event.target.value)}
                placeholder="0"
              />
            </div>

            {isTransfer && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="txn-fee">Fee</Label>
                <Input
                  id="txn-fee"
                  type="tel"
                  inputMode="numeric"
                  value={formState.fee}
                  onChange={(event) => handleFieldChange("fee", event.target.value)}
                  placeholder="0"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Label htmlFor="txn-date">Date</Label>
              <Input
                id="txn-date"
                type="date"
                value={formState.date}
                onChange={(event) => handleFieldChange("date", event.target.value)}
              />
            </div>
          </div>

          {!isTransfer && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((p) => !p)}
                  className="text-[10px] font-medium text-primary"
                >
                  {showNewCategory ? "Cancel" : "+ Custom"}
                </button>
              </div>

              {showNewCategory && (
                <div className="flex gap-2 rounded-xl border border-border-subtle bg-background-soft p-2">
                  <Input
                    type="text"
                    value={newCategoryForm.icon}
                    onChange={(event) =>
                      setNewCategoryForm((p) => ({ ...p, icon: event.target.value }))
                    }
                    className="h-8 w-12 text-center text-base"
                    placeholder="📌"
                  />
                  <Input
                    type="text"
                    value={newCategoryForm.name}
                    onChange={(event) =>
                      setNewCategoryForm((p) => ({ ...p, name: event.target.value }))
                    }
                    className="h-8 flex-1"
                    placeholder="Category name"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    onClick={handleAddCustomCategory}
                    disabled={!newCategoryForm.name.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.uid}
                    type="button"
                    onClick={() => handleFieldChange("ctgUid", cat.uid)}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-[11px] font-medium transition",
                      formState.ctgUid === cat.uid
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : "bg-background-soft text-muted hover:text-foreground",
                    )}
                  >
                    {getCategoryIcon(cat.uid, categories)}{" "}
                    {getCategoryDisplayName(cat.uid, categories)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="txn-content">Description</Label>
            <Input
              id="txn-content"
              type="text"
              value={formState.content}
              onChange={(event) => handleFieldChange("content", event.target.value)}
              placeholder="e.g. Coffee, salary, groceries"
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
