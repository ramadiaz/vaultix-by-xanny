"use client";

import { useEffect, useState } from "react";
import { hasPendingSyncData } from "../services/pending-sync.service";

export function useHasPendingSync(): boolean {
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    function update() {
      setHasPending(hasPendingSyncData());
    }

    update();
    window.addEventListener("vaultix:pending-sync-changed", update);
    window.addEventListener("vaultix:data-reload", update);
    return () => {
      window.removeEventListener("vaultix:pending-sync-changed", update);
      window.removeEventListener("vaultix:data-reload", update);
    };
  }, []);

  return hasPending;
}
