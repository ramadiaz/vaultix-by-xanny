"use client";

import { useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { exportVaultixBackup } from "@/features/import-export/services/vaultix-export.service";
import { exportAsMmbak } from "@/features/import-export/services/mmbak-export.service";
import {
  applyMoneyManagerImport,
  applyVaultixImport,
  applyMmbakImport,
  parseVaultixJson,
} from "@/features/import-export/services/vaultix-import.service";
import { parseMoneyManagerExcel } from "@/features/import-export/services/money-manager-parser.service";
import { parseMmbakFile, MmbakImportResult } from "@/features/import-export/services/mmbak-import.service";
import { getStoredAssets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import { ImportResult } from "@/features/import-export/types/import-export";
import { cn } from "@/lib/utils/cn";

type ImportMode = "replace" | "merge";

type ImportSource = "excel" | "json" | "mmbak";

type ImportStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "preview"; result: ImportResult; mode: ImportMode; source: ImportSource; rawJson?: string; mmbakData?: MmbakImportResult }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export default function SettingsPage() {
  const { signOut } = useAuth();
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const mmbakInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: "idle" });
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [isExportingMmbak, setIsExportingMmbak] = useState(false);

  async function handleExportJson() {
    await exportVaultixBackup();
  }

  async function handleExportMmbak() {
    setIsExportingMmbak(true);
    try {
      await exportAsMmbak();
    } catch {
      alert("Failed to export .mmbak file.");
    } finally {
      setIsExportingMmbak(false);
    }
  }

  function handleExcelFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const text = loadEvent.target?.result as string;
        const data = parseVaultixJson(text);

        setImportStatus({
          state: "preview",
          result: {
            assets: data.assets,
            transactions: data.transactions,
            categories: data.categories ?? [],
            summary: {
              totalAssets: data.assets.length,
              totalTransactions: data.transactions.length,
              totalCategories: (data.categories ?? []).length,
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

  function handleMmbakFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ state: "loading" });

    const reader = new FileReader();

    reader.onload = async (loadEvent) => {
      try {
        const buffer = loadEvent.target?.result as ArrayBuffer;
        const data = await parseMmbakFile(buffer);

        setImportStatus({
          state: "preview",
          result: {
            assets: data.assets,
            transactions: data.transactions,
            categories: data.categories,
            summary: data.summary,
          },
          mode: importMode,
          source: "mmbak",
          mmbakData: data,
        });
      } catch (err) {
        setImportStatus({
          state: "error",
          message: `Failed to parse .mmbak file: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }
    };

    reader.readAsArrayBuffer(file);

    if (mmbakInputRef.current) {
      mmbakInputRef.current.value = "";
    }
  }

  async function handleConfirmImport() {
    if (importStatus.state !== "preview") return;

    try {
      const [existingAssets, existingTransactions, existingCategories] = await Promise.all([
        getStoredAssets(),
        getStoredTransactions(),
        getStoredCategories(),
      ]);

      if (importStatus.source === "mmbak" && importStatus.mmbakData) {
        await applyMmbakImport(
          importStatus.mmbakData,
          importMode,
          existingAssets,
          existingTransactions,
          existingCategories,
        );
      } else if (importStatus.source === "json" && importStatus.rawJson) {
        const data = parseVaultixJson(importStatus.rawJson);
        await applyVaultixImport(
          data,
          importMode,
          existingAssets,
          existingTransactions,
          existingCategories,
        );
      } else {
        await applyMoneyManagerImport(
          importStatus.result.assets,
          importStatus.result.transactions,
          importStatus.result.categories,
          importMode,
          existingAssets,
          existingTransactions,
          existingCategories,
        );
      }

      const { summary } = importStatus.result;

      setImportStatus({
        state: "success",
        message: `Imported ${summary.totalAssets} wallets, ${summary.totalTransactions} transactions, ${summary.totalCategories} categories.`,
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

  const sourceLabel: Record<ImportSource, string> = {
    excel: "Money Manager Excel",
    json: "Vaultix JSON",
    mmbak: "Money Manager Backup (.mmbak)",
  };

  return (
    <AuthGate>
      <MobileShell title="Settings" activeTab="settings">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Export</h3>
            <p className="text-[11px] leading-relaxed text-muted">
              Download your data as a backup file.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={handleExportJson} className="h-9">
                Export .json
              </Button>
              <Button
                type="button"
                onClick={handleExportMmbak}
                className="h-9"
                disabled={isExportingMmbak}
              >
                {isExportingMmbak ? "Exporting..." : "Export .mmbak"}
              </Button>
            </div>
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
                Money Manager backup (.mmbak):
              </p>
              <input
                ref={mmbakInputRef}
                type="file"
                accept=".mmbak"
                onChange={handleMmbakFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={() => mmbakInputRef.current?.click()}
              >
                Import .mmbak
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] leading-relaxed text-muted">
                Money Manager Excel export (.xls/.xlsx):
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
                Import .xls / .xlsx
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] leading-relaxed text-muted">
                Vaultix backup file (.json):
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
                Import .json
              </Button>
            </div>
          </Card>

          {importStatus.state === "loading" && (
            <Card className="flex items-center justify-center py-6">
              <p className="text-[12px] font-medium text-muted animate-pulse">
                Parsing .mmbak file...
              </p>
            </Card>
          )}

          {importStatus.state === "preview" && (
            <Card className="flex flex-col gap-3 border-primary/30">
              <h3 className="text-sm font-semibold text-foreground">
                Import preview
              </h3>
              <p className="text-[11px] text-muted">
                Source: <span className="font-medium text-foreground">{sourceLabel[importStatus.source]}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Wallets</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalAssets}
                  </p>
                </div>
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Transactions</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalTransactions}
                  </p>
                </div>
                <div className="rounded-xl bg-background-soft px-3 py-2">
                  <span className="text-muted-soft">Categories</span>
                  <p className="font-semibold text-foreground">
                    {importStatus.result.summary.totalCategories}
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
