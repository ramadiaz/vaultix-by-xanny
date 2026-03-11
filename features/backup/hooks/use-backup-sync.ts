import { useState, useCallback } from "react";
import { performSync } from "@/features/backup/services/backup.service";

type BackupSyncState =
  | { status: "idle" }
  | { status: "syncing" }
  | { status: "synced"; message: string }
  | { status: "error"; message: string };

export function useBackupSync() {
  const [state, setState] = useState<BackupSyncState>({ status: "idle" });

  const sync = useCallback(async () => {
    setState({ status: "syncing" });
    try {
      await performSync();
      setState({
        status: "synced",
        message: "Synced successfully.",
      });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to sync",
      });
    }
  }, []);

  const clearState = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    state,
    sync,
    clearState,
  };
}
