import { useState, useCallback } from "react";
import {
  syncToBackupServer,
  fetchBackupsFromServer,
  downloadBackupFromServer,
  BackupItem,
} from "@/features/backup/services/backup.service";
import {
  parseVaultixJson,
  applyVaultixImport,
} from "@/features/import-export/services/vaultix-import.service";
import { getStoredAssets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";

type BackupSyncState =
  | { status: "idle" }
  | { status: "syncing" }
  | { status: "synced"; message: string }
  | { status: "listing" }
  | { status: "restoring" }
  | { status: "restored"; message: string }
  | { status: "error"; message: string };

export function useBackupSync() {
  const [state, setState] = useState<BackupSyncState>({ status: "idle" });
  const [backups, setBackups] = useState<BackupItem[]>([]);

  const sync = useCallback(async () => {
    setState({ status: "syncing" });
    try {
      await syncToBackupServer();
      setState({
        status: "synced",
        message: "Backup synced successfully.",
      });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to sync backup",
      });
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    setState({ status: "listing" });
    try {
      const items = await fetchBackupsFromServer();
      setBackups(items);
      setState({ status: "idle" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to list backups",
      });
    }
  }, []);

  const restore = useCallback(async (backupId: string) => {
    setState({ status: "restoring" });
    try {
      const json = await downloadBackupFromServer(backupId);
      const parsed = parseVaultixJson(json);
      const [existingAssets, existingTransactions, existingCategories] =
        await Promise.all([
          getStoredAssets(),
          getStoredTransactions(),
          getStoredCategories(),
        ]);
      await applyVaultixImport(
        parsed,
        "replace",
        existingAssets,
        existingTransactions,
        existingCategories
      );
      setState({
        status: "restored",
        message: "Data restored successfully. Reload the page to see changes.",
      });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to restore backup",
      });
    }
  }, []);

  const restoreLatest = useCallback(async () => {
    const items = await fetchBackupsFromServer();
    const latest = items[0];
    if (!latest) {
      setState({
        status: "error",
        message: "No backups found.",
      });
      return;
    }
    await restore(latest.id);
  }, [restore]);

  const clearState = useCallback(() => {
    setState({ status: "idle" });
    setBackups([]);
  }, []);

  return {
    state: state,
    backups,
    sync,
    fetchBackups,
    restore,
    restoreLatest,
    clearState,
  };
}
