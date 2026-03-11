import { buildExportData } from "@/features/import-export/services/vaultix-export.service";
import {
  applyVaultixImport,
  parseVaultixJson,
} from "@/features/import-export/services/vaultix-import.service";
import { VaultixExportData } from "@/features/import-export/types/import-export";
import { getStoredAssets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import {
  uploadBackup,
  listBackups,
  downloadBackup,
  BackupListItem,
} from "@/lib/api/backup.api";

export type BackupItem = BackupListItem;

const DATA_RELOAD_EVENT = "vaultix:data-reload";

export async function pullFromServer(): Promise<VaultixExportData | null> {
  const res = await listBackups();
  const items = res.data;
  const latest = items[0];
  if (!latest) return null;
  const json = await downloadBackup(latest.id).then((r) => r.data);
  return parseVaultixJson(json);
}

export async function pushToServer(): Promise<void> {
  const data = await buildExportData();
  const dateStr = data.exportedAt.split("T")[0];
  await uploadBackup(data, dateStr);
}

export async function performSync(): Promise<void> {
  const [existingAssets, existingTransactions, existingCategories] =
    await Promise.all([
      getStoredAssets(),
      getStoredTransactions(),
      getStoredCategories(),
    ]);

  const serverData = await pullFromServer();
  if (serverData) {
    await applyVaultixImport(
      serverData,
      "merge",
      existingAssets,
      existingTransactions,
      existingCategories
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DATA_RELOAD_EVENT));
    }
  }

  await pushToServer();
}

export async function syncToBackupServer(): Promise<void> {
  await pushToServer();
}

export async function fetchBackupsFromServer(): Promise<BackupItem[]> {
  const res = await listBackups();
  return res.data;
}

export async function downloadBackupFromServer(id: string): Promise<string> {
  const res = await downloadBackup(id);
  return res.data;
}
