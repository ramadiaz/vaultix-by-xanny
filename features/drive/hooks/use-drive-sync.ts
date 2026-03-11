import { useState, useCallback } from "react";
import { requestDriveAccessToken } from "@/features/drive/services/drive-token.service";
import {
  syncToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  DriveBackupItem,
} from "@/features/drive/services/drive-sync.service";
import {
  parseVaultixJson,
  applyVaultixImport,
} from "@/features/import-export/services/vaultix-import.service";
import { getStoredAssets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";

type DriveSyncState =
  | { status: "idle" }
  | { status: "syncing" }
  | { status: "synced"; message: string }
  | { status: "listing" }
  | { status: "restoring" }
  | { status: "restored"; message: string }
  | { status: "error"; message: string };

export function useDriveSync() {
  const [state, setState] = useState<DriveSyncState>({ status: "idle" });
  const [backups, setBackups] = useState<DriveBackupItem[]>([]);

  const sync = useCallback(async () => {
    setState({ status: "syncing" });
    try {
      await syncToDrive();
      setState({
        status: "synced",
        message: "Backup synced to Google Drive successfully.",
      });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to sync to Drive",
      });
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    setState({ status: "listing" });
    try {
      const token = await requestDriveAccessToken();
      const items = await listBackupsFromDrive(token);
      setBackups(items);
      setState({ status: "idle" });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to list Drive backups",
      });
    }
  }, []);

  const restore = useCallback(async (fileId: string) => {
    setState({ status: "restoring" });
    try {
      const token = await requestDriveAccessToken();
      const json = await downloadBackupFromDrive(token, fileId);
      const data = parseVaultixJson(json);
      const [existingAssets, existingTransactions, existingCategories] =
        await Promise.all([
          getStoredAssets(),
          getStoredTransactions(),
          getStoredCategories(),
        ]);
      await applyVaultixImport(
        data,
        "replace",
        existingAssets,
        existingTransactions,
        existingCategories
      );
      setState({
        status: "restored",
        message: "Data restored from Google Drive. Reload the page to see changes.",
      });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to restore from Drive",
      });
    }
  }, []);

  const restoreLatest = useCallback(async () => {
    const token = await requestDriveAccessToken();
    const items = await listBackupsFromDrive(token);
    const latest = items[0];
    if (!latest) {
      setState({
        status: "error",
        message: "No Vaultix backups found in Google Drive.",
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
    state,
    backups,
    sync,
    fetchBackups,
    restore,
    restoreLatest,
    clearState,
  };
}
