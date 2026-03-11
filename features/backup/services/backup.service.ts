import { buildExportData } from "@/features/import-export/services/vaultix-export.service";
import {
  applyVaultixImport,
  parseVaultixJson,
} from "@/features/import-export/services/vaultix-import.service";
import { VaultixExportData } from "@/features/import-export/types/import-export";
import { sync as syncApi } from "@/lib/api/sync.api";
import { computeDelta, setLastSynced } from "@/features/sync/services/delta.service";
import { clearAllPendingSync } from "@/features/sync/services/pending-sync.service";

const DATA_RELOAD_EVENT = "vaultix:data-reload";

type RawSyncData = Record<string, unknown> & Partial<VaultixExportData>;

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

function normalizeMergedData(raw: unknown): VaultixExportData {
  const data: RawSyncData = typeof raw === "string"
    ? (parseVaultixJson(raw) as RawSyncData)
    : (raw as RawSyncData);
  const assets = toArray(data.wallets && !data.assets ? data.wallets : data.assets);
  const categories = toArray(data.customCategories && !data.categories ? data.customCategories : data.categories);
  return {
    version: (data.version as number) ?? 2,
    exportedAt: (data.exportedAt as string) ?? new Date().toISOString(),
    assets: assets as VaultixExportData["assets"],
    assetGroups: toArray(data.assetGroups) as VaultixExportData["assetGroups"],
    currencies: toArray(data.currencies) as VaultixExportData["currencies"],
    transactions: toArray(data.transactions) as VaultixExportData["transactions"],
    categories: categories as VaultixExportData["categories"],
  };
}

export async function performSync(): Promise<void> {
  const current = await buildExportData();
  const delta = computeDelta(current);
  const merged = await syncApi(delta);
  const normalized = normalizeMergedData(merged);

  await applyVaultixImport(
    normalized,
    "replace",
    [],
    [],
    []
  );

  setLastSynced(normalized);
  clearAllPendingSync();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DATA_RELOAD_EVENT));
  }
}
