"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useBackupSync } from "@/features/backup/hooks/use-backup-sync";

const DATA_CHANGED_EVENT = "vaultix:data-changed";
const DEBOUNCE_MS = 2500;

export function SyncManager() {
  const { user } = useAuth();
  const { sync } = useBackupSync();
  const isSyncingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    function handleDataChanged() {
      if (isSyncingRef.current) return;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        debounceTimerRef.current = null;
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        try {
          await sync();
        } finally {
          isSyncingRef.current = false;
        }
      }, DEBOUNCE_MS);
    }

    window.addEventListener(DATA_CHANGED_EVENT, handleDataChanged);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChanged);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [user, sync]);

  return null;
}
