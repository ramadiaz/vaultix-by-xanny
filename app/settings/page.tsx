"use client";

import { useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDriveSync } from "@/features/drive/hooks/use-drive-sync";
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
import { useCategories } from "@/features/transactions/hooks/use-custom-categories";
import { Category } from "@/features/transactions/types/transaction";
import { getStoredAssets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import { ImportResult } from "@/features/import-export/types/import-export";
import { cn } from "@/lib/utils/cn";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const {
    state: driveState,
    backups,
    sync: syncToDrive,
    fetchBackups,
    restore,
    restoreLatest,
    clearState: clearDriveState,
  } = useDriveSync();
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const mmbakInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: "idle" });
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [isExportingMmbak, setIsExportingMmbak] = useState(false);
  const {
    categories,
    isLoading: isCategoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📌");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense");
  const [editingCategoryUid, setEditingCategoryUid] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("📌");

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

  function handleAddCategoryClick() {
    if (!newCategoryName.trim()) return;
    const typeValue = newCategoryType === "income" ? 0 : 1;
    const name = `${newCategoryIcon} ${newCategoryName.trim()}`.trim();
    const category: Category = {
      uid: `cat_${Date.now()}`,
      name,
      type: typeValue as 0 | 1,
      status: 0,
      pUid: null,
      orderSeq: 99,
      isDel: false,
      utime: Date.now(),
    };
    addCategory(category);
    setNewCategoryName("");
    setNewCategoryIcon("📌");
    setNewCategoryType("expense");
  }

  function startEditCategory(category: Category) {
    setEditingCategoryUid(category.uid);
    const parts = category.name.split(" ");
    if (parts.length > 1) {
      setEditingIcon(parts[0]);
      setEditingName(parts.slice(1).join(" "));
    } else {
      setEditingIcon("📌");
      setEditingName(category.name);
    }
  }

  function handleSaveCategoryEdit() {
    if (!editingCategoryUid || !editingName.trim()) {
      setEditingCategoryUid(null);
      setEditingName("");
      setEditingIcon("📌");
      return;
    }
    const name = `${editingIcon} ${editingName.trim()}`.trim();
    updateCategory(editingCategoryUid, {
      name,
      utime: Date.now(),
    });
    setEditingCategoryUid(null);
    setEditingName("");
    setEditingIcon("📌");
  }

  function handleDeleteCategoryClick(category: Category) {
    deleteCategory(category.uid);
    if (editingCategoryUid === category.uid) {
      setEditingCategoryUid(null);
      setEditingName("");
      setEditingIcon("📌");
    }
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
                {isExportingMmbak ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Exporting
                  </span>
                ) : (
                  "Export .mmbak"
                )}
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Google Drive Sync
            </h3>
            <p className="text-[11px] leading-relaxed text-muted">
              Backup and restore your data from your Google Drive.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={syncToDrive}
                disabled={
                  driveState.status === "syncing" ||
                  driveState.status === "listing" ||
                  driveState.status === "restoring"
                }
              >
                {driveState.status === "syncing" ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Syncing
                  </span>
                ) : (
                  "Sync to Drive"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                onClick={fetchBackups}
                disabled={
                  driveState.status === "syncing" ||
                  driveState.status === "listing" ||
                  driveState.status === "restoring"
                }
              >
                {driveState.status === "listing" ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Loading
                  </span>
                ) : (
                  "Restore from Drive"
                )}
              </Button>
            </div>
            {backups.length > 0 && (
              <div className="flex flex-col gap-1 rounded-xl border border-border-subtle bg-background-soft p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-muted-soft">
                    Available backups
                  </p>
                  {driveState.status === "restoring" && (
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
                      <LoadingSpinner size="sm" />
                      Restoring
                    </span>
                  )}
                </div>
                {backups.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-background"
                  >
                    <span className="truncate text-xs text-foreground">
                      {b.name}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => restore(b.id)}
                      disabled={driveState.status === "restoring"}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {(driveState.status === "synced" ||
              driveState.status === "restored") && (
              <div className="flex flex-col gap-1">
                <p className="text-[12px] font-medium text-success">
                  {driveState.message}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit text-xs"
                  onClick={clearDriveState}
                >
                  Dismiss
                </Button>
              </div>
            )}
            {driveState.status === "error" && (
              <div className="flex flex-col gap-1">
                <p className="text-[12px] font-medium text-danger">
                  {driveState.message}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit text-xs"
                  onClick={clearDriveState}
                >
                  Dismiss
                </Button>
              </div>
            )}
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
            <Card className="flex flex-col items-center justify-center gap-3 py-8">
              <LoadingSpinner size="lg" />
              <p className="text-xs font-medium text-muted">
                Parsing .mmbak file
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

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Categories</h3>
              {!isCategoriesLoading && (
                <span className="text-[11px] text-muted">
                  {categories.filter((c) => !c.isDel && c.status === 0).length} total
                </span>
              )}
            </div>

            <div className="flex gap-1 rounded-xl bg-background-soft p-1">
              {(["income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewCategoryType(t)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-center text-[11px] font-semibold capitalize transition",
                    newCategoryType === t
                      ? t === "income"
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                      : "text-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-subtle">
              {categories
                .filter(
                  (c) =>
                    !c.isDel &&
                    c.status === 0 &&
                    c.type === (newCategoryType === "income" ? 0 : 1),
                )
                .sort((a, b) => a.orderSeq - b.orderSeq)
                .map((category) => {
                  const isEditingRow = editingCategoryUid === category.uid;
                  const firstWord = category.name.split(" ")[0];
                  const rest = category.name.split(" ").slice(1).join(" ") || category.name;
                  return (
                    <div key={category.uid} className="bg-background-soft">
                      {isEditingRow ? (
                        <div className="flex flex-col gap-2 px-4 py-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingIcon}
                              onChange={(event) => setEditingIcon(event.target.value)}
                              style={{ width: "2.75rem", flexShrink: 0 }}
                              className="h-10 rounded-xl border border-border-subtle bg-background text-center text-lg outline-none focus:border-primary"
                            />
                            <input
                              type="text"
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value)}
                              className="h-10 min-w-0 flex-1 rounded-xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                              placeholder="Category name"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-9 flex-1"
                              onClick={handleSaveCategoryEdit}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-9 flex-1"
                              onClick={() => setEditingCategoryUid(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-lg">
                            {firstWord}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                            {rest}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditCategory(category)}
                            className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-semibold text-primary active:bg-primary/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryClick(category)}
                            className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-semibold text-danger active:bg-danger/10"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {categories.filter(
                (c) =>
                  !c.isDel &&
                  c.status === 0 &&
                  c.type === (newCategoryType === "income" ? 0 : 1),
              ).length === 0 && (
                <div className="flex flex-col items-center gap-1 bg-background-soft px-4 py-8 text-center">
                  <p className="text-[12px] font-medium text-foreground">
                    No {newCategoryType} categories
                  </p>
                  <p className="text-[11px] text-muted">Add one below.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-background-soft px-4 py-4">
              <p className="text-[11px] font-medium text-muted-soft">
                New {newCategoryType} category
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryIcon}
                  onChange={(event) => setNewCategoryIcon(event.target.value)}
                  style={{ width: "2.75rem", flexShrink: 0 }}
                  className="h-11 rounded-2xl border border-border-subtle bg-background text-center text-xl outline-none focus:border-primary"
                  placeholder="📌"
                />
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-2xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Category name"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleAddCategoryClick();
                  }}
                />
              </div>
              <Button
                type="button"
                className="h-11 w-full"
                onClick={handleAddCategoryClick}
                disabled={!newCategoryName.trim()}
              >
                Add category
              </Button>
            </div>
          </Card>
        </div>
      </MobileShell>
    </AuthGate>
  );
}
