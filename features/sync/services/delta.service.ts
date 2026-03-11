import { VaultixExportData } from "@/features/import-export/types/import-export";
import {
  getDeletedTransactionUids,
  getDeletedAssetUids,
  getDeletedCategoryUids,
} from "./pending-sync.service";

const LAST_SYNCED_KEY = "vaultix:last-synced";

export type EntityDelta<T> = {
  added: T[];
  updated: T[];
  deleted: string[];
};

export type SyncDelta = {
  assets: EntityDelta<Record<string, unknown>>;
  transactions: EntityDelta<Record<string, unknown>>;
  categories: EntityDelta<Record<string, unknown>>;
  assetGroups: EntityDelta<Record<string, unknown>>;
  currencies: EntityDelta<Record<string, unknown>>;
};

function getUid(item: { uid?: string }): string {
  return item.uid ?? "";
}

export function getLastSynced(): VaultixExportData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_SYNCED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultixExportData;
  } catch {
    return null;
  }
}

export function setLastSynced(data: VaultixExportData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SYNCED_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

function computeEntityDelta<T extends { uid?: string; utime?: number }>(
  current: T[],
  last: T[] | undefined,
  pendingDeleted: Set<string>
): EntityDelta<Record<string, unknown>> {
  const lastMap = new Map<string, T>();
  for (const item of last ?? []) {
    const uid = getUid(item);
    if (uid) lastMap.set(uid, item);
  }
  const currentMap = new Map<string, T>();
  for (const item of current) {
    const uid = getUid(item);
    if (uid) currentMap.set(uid, item);
  }

  const added: Record<string, unknown>[] = [];
  const updated: Record<string, unknown>[] = [];
  const deletedSet = new Set<string>(pendingDeleted);

  for (const [uid, item] of currentMap) {
    if (!lastMap.has(uid)) {
      added.push(item as unknown as Record<string, unknown>);
    } else {
      const lastItem = lastMap.get(uid)!;
      const currentUtime = item.utime ?? 0;
      const lastUtime = lastItem.utime ?? 0;
      if (currentUtime > lastUtime) {
        updated.push(item as unknown as Record<string, unknown>);
      }
    }
  }

  for (const uid of lastMap.keys()) {
    if (!currentMap.has(uid)) {
      deletedSet.add(uid);
    }
  }

  return {
    added,
    updated,
    deleted: Array.from(deletedSet),
  };
}

export function computeDelta(current: VaultixExportData): SyncDelta {
  const last = getLastSynced();
  const pendingTx = getDeletedTransactionUids();
  const pendingAssets = getDeletedAssetUids();
  const pendingCats = getDeletedCategoryUids();

  return {
    assets: computeEntityDelta(
      current.assets,
      last?.assets,
      pendingAssets
    ),
    transactions: computeEntityDelta(
      current.transactions,
      last?.transactions,
      pendingTx
    ),
    categories: computeEntityDelta(
      current.categories,
      last?.categories,
      pendingCats
    ),
    assetGroups: computeEntityDelta(
      current.assetGroups ?? [],
      last?.assetGroups,
      new Set()
    ),
    currencies: computeEntityDelta(
      current.currencies ?? [],
      last?.currencies,
      new Set()
    ),
  };
}
