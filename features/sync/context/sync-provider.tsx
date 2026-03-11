"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { performSync } from "@/features/backup/services/backup.service";

type SyncState =
  | { status: "idle" }
  | { status: "syncing" }
  | { status: "synced"; message: string }
  | { status: "error"; message: string };

type SyncContextValue = {
  state: SyncState;
  sync: () => Promise<void>;
  clearState: () => void;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SyncState>({ status: "idle" });

  const sync = useCallback(async () => {
    setState({ status: "syncing" });
    try {
      await performSync();
      setState({ status: "synced", message: "Synced successfully." });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to sync",
      });
    }
  }, []);

  const clearState = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return (
    <SyncContext.Provider value={{ state, sync, clearState }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return ctx;
}
