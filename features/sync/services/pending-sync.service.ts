const STORAGE_KEY = "vaultix:pending-sync";

type PendingSyncState = {
  deletedTransactionUids: string[];
  deletedAssetUids: string[];
  deletedCategoryUids: string[];
};

function load(): PendingSyncState {
  if (typeof window === "undefined") {
    return {
      deletedTransactionUids: [],
      deletedAssetUids: [],
      deletedCategoryUids: [],
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmpty();
    const parsed = JSON.parse(raw) as PendingSyncState;
    return {
      deletedTransactionUids: Array.isArray(parsed.deletedTransactionUids)
        ? parsed.deletedTransactionUids
        : [],
      deletedAssetUids: Array.isArray(parsed.deletedAssetUids)
        ? parsed.deletedAssetUids
        : [],
      deletedCategoryUids: Array.isArray(parsed.deletedCategoryUids)
        ? parsed.deletedCategoryUids
        : [],
    };
  } catch {
    return getEmpty();
  }
}

function getEmpty(): PendingSyncState {
  return {
    deletedTransactionUids: [],
    deletedAssetUids: [],
    deletedCategoryUids: [],
  };
}

function save(state: PendingSyncState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

export function getDeletedTransactionUids(): Set<string> {
  return new Set(load().deletedTransactionUids);
}

export function getDeletedAssetUids(): Set<string> {
  return new Set(load().deletedAssetUids);
}

export function getDeletedCategoryUids(): Set<string> {
  return new Set(load().deletedCategoryUids);
}

export function addDeletedTransactionUids(uids: string[]): void {
  const state = load();
  const existing = new Set(state.deletedTransactionUids);
  for (const uid of uids) {
    existing.add(uid);
  }
  state.deletedTransactionUids = Array.from(existing);
  save(state);
}

export function addDeletedAssetUids(uids: string[]): void {
  const state = load();
  const existing = new Set(state.deletedAssetUids);
  for (const uid of uids) {
    existing.add(uid);
  }
  state.deletedAssetUids = Array.from(existing);
  save(state);
}

export function addDeletedCategoryUids(uids: string[]): void {
  const state = load();
  const existing = new Set(state.deletedCategoryUids);
  for (const uid of uids) {
    existing.add(uid);
  }
  state.deletedCategoryUids = Array.from(existing);
  save(state);
}

export function clearDeletedUidsPresentIn(
  transactionUids: string[],
  assetUids: string[],
  categoryUids: string[]
): void {
  const txSet = new Set(transactionUids);
  const assetSet = new Set(assetUids);
  const catSet = new Set(categoryUids);
  const state = load();
  state.deletedTransactionUids = state.deletedTransactionUids.filter(
    (uid) => !txSet.has(uid)
  );
  state.deletedAssetUids = state.deletedAssetUids.filter(
    (uid) => !assetSet.has(uid)
  );
  state.deletedCategoryUids = state.deletedCategoryUids.filter(
    (uid) => !catSet.has(uid)
  );
  save(state);
}
