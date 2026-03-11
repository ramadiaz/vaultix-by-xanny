"use client";

import { useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { exportVaultixBackup } from "@/features/import-export/services/vaultix-export.service";
import {
  applyMoneyManagerImport,
  applyVaultixImport,
  parseVaultixJson,
} from "@/features/import-export/services/vaultix-import.service";
import { parseMoneyManagerExcel } from "@/features/import-export/services/money-manager-parser.service";
import { getStoredWallets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCustomCategories } from "@/features/transactions/services/category-storage.service";
import { ImportResult } from "@/features/import-export/types/import-export";
import { cn } from "@/lib/utils/cn";

type ImportMode = "replace" | "merge";

type ImportStatus =
  | { state: "idle" }
  | { state: "preview"; result: ImportResult; mode: ImportMode; source: "excel" | "json"; rawJson?: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export default function SettingsPage() {
  const { signOut } = useAuth();
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: "idle" });
  const [importMode, setImportMode] = useState<ImportMode>("merge");

  function handleExport() {
    exportVaultixBackup();
  }

  function handleExcelFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const buffer = loadEvent.target?.result as ArrayBuffer;
        const result = parseMoneyManagerExcel(buffer);

        setImportStatus({
          state: "preview",
          result,
          mode: importMode,
          source: "excel",
        });
      } catch {
        setImportStatus({
          state: "error",
          message: "Failed to parse Excel file. Make sure it is a valid Money Manager export.",
        });
      }
    };

    reader.readAsArrayBuffer(file);

    if (excelInputRef.current) {
      excelInputRef.current.value = "";
    }
  }

  function handleJsonFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const text = loadEvent.target?.result as string;
        const data = parseVaultixJson(text);

        setImportStatus({
          state: "preview",
          result: {
            wallets: data.wallets,
            transactions: data.transactions,
            customCategories: data.customCategories ?? [],
            summary: {
              totalWallets: data.wallets.length,
              totalTransactions: data.transactions.length,
              totalCustomCategories: (data.customCategories ?? []).length,
              skippedTransferIn: 0,
            },
          },
          mode: importMode,
          source: "json",
          rawJson: text,
        });
      } catch {
        setImportStatus({
          state: "error",
          message: "Failed to parse JSON file. Make sure it is a valid Vaultix backup.",
        });
      }
    };

    reader.readAsText(file);

    if (jsonInputRef.current) {
      jsonInputRef.current.value = "";
    }
  }

  function handleConfirmImport() {
    if (importStatus.state !== "preview") {
      return;
    }

    try {
      const existingWallets = getStoredWallets();
      const existingTransactions = getStoredTransactions();
      const existingCustomCategories = getStoredCustomCategories();

      if (importStatus.source === "json" && importStatus.rawJson) {
        const data = parseVaultixJson(importStatus.rawJson);
        applyVaultixImport(
          data,
          importMode,
          existingWallets,
          existingTransactions,
          existingCustomCategories,
        );
      } else {
        applyMoneyManagerImport(
          importStatus.result.wallets,
          importStatus.result.transactions,
          importStatus.result.customCategories,
          importMode,
          existingWallets,
          existingTransactions,
          existingCustomCategories,
        );
      }

      const { summary } = importStatus.result;

      setImportStatus({
        state: "success",
        message: `Imported ${summary.totalWallets} wallets, ${summary.totalTransactions} transactions, ${summary.totalCustomCategories} custom categories.`,
      });
    } catch {
      setImportStatus({
        state: "error",
        message: "Failed to apply import. Please try again.",
      });
    }
  }

  function handleCancelImport() {
    setImportStatus({ state: "idle" });
  }

  return (
    <AuthGate>
      <MobileShell title="Settings" activeTab="settings">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Export</h3>
            <p className="text-[11px] leading-relaxed text-muted">
              Download all your wallets, transactions, and categories as a JSON
              backup file.
            </p>
            <Button type="button" onClick={handleExport} className="h-9">
              Export backup (.json)
            </Button>
          </Card>

          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Import</h3>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-muted-soft">Import mode</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImportMode("merge")}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-center text-[11px] font-medium transition",
                    importMode === "merge"
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-background-soft text-muted",
                  )}
                >
                  Merge (keep existing)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("replace")}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-center text-[11px] font-medium transition",
                    importMode === "replace"
                      ? "bg-danger/15 text-danger ring-1 ring-danger/30"
                      : "bg-background-soft text-muted",
                  )}
                >
                  Replace (overwrite all)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] leading-relaxed text-muted">
                Import from Money Manager Excel export (.xls/.xlsx):
              </p>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleExcelFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={() => excelInputRef.current?.click()}
              >
                Import Money Manager (.xls)
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] leading-relaxed text-muted">
                Restore from a Vaultix backup file (.json):
              </p>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={() => jsonInputRef.current?.click()}
              >
                Import Vaultix backup (.json)
              </Button>
            </div>
          </Card>

          {importStatus.state === "preview" && (
            <Card className="flex flex-col gap-3 border-primary/30">
              <h3 className="text-sm font-semibold text-foreground">
                Import preview
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Wallets</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalWallets}
                  </p>
                </div>
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Transactions</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalTransactions}
                  </p>
                </div>
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Custom categories</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalCustomCategories}
                  </p>
                </div>
                {importStatus.result.summary.skippedTransferIn > 0 && (
                  <div className="rounded-xl bg-background-soft px-3 py-2">
                    <span className="text-muted-soft">Skipped (Transfer-In)</span>
                    <p className="font-semibold text-foreground">
                      {importStatus.result.summary.skippedTransferIn}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted">
                Mode:{" "}
                <span className="font-medium text-foreground">
                  {importMode === "merge" ? "Merge" : "Replace"}
                </span>
                {importMode === "replace" && (
                  <span className="ml-1 text-danger">
                    (this will overwrite all existing data)
                  </span>
                )}
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-9"
                  onClick={handleCancelImport}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-9"
                  onClick={handleConfirmImport}
                >
                  Confirm import
                </Button>
              </div>
            </Card>
          )}

          {importStatus.state === "success" && (
            <Card className="border-success/30">
              <p className="text-[12px] font-medium text-success">
                {importStatus.message}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Reload the page to see your imported data.
              </p>
            </Card>
          )}

          {importStatus.state === "error" && (
            <Card className="border-danger/30">
              <p className="text-[12px] font-medium text-danger">
                {importStatus.message}
              </p>
            </Card>
          )}

          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-danger"
              onClick={signOut}
            >
              Sign out
            </Button>
          </Card>
        </div>
      </MobileShell>
    </AuthGate>
  );
}
