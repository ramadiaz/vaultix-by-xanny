import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Asset, AssetGroup, Currency } from "../types/wallet";
import { DEFAULT_ASSET_GROUPS, DEFAULT_CURRENCIES } from "../config/wallet-config";

const ASSETS_KEY = "vaultix.assets";
const ASSET_GROUPS_KEY = "vaultix.asset_groups";
const CURRENCIES_KEY = "vaultix.currencies";

function sanitizeAsset(a: Record<string, unknown>): Asset {
  return {
    ...a,
    balance: Number(a.balance) || 0,
    orderSeq: Number(a.orderSeq) || 0,
    utime: Number(a.utime) || 0,
    isArchived: a.isArchived === true || Number(a.isArchived) === 1,
    isTransExpense: a.isTransExpense === true || Number(a.isTransExpense) === 1,
    isCardAutoPay: a.isCardAutoPay === true || Number(a.isCardAutoPay) === 1,
  } as Asset;
}

export function getStoredAssets(): Asset[] {
  const raw = readLocalStorage<Record<string, unknown>[]>(ASSETS_KEY, []);
  return raw.map(sanitizeAsset);
}

export function storeAssets(assets: Asset[]) {
  writeLocalStorage(ASSETS_KEY, assets);
}

export function getStoredAssetGroups(): AssetGroup[] {
  const stored = readLocalStorage<AssetGroup[] | null>(ASSET_GROUPS_KEY, null);
  if (!stored || stored.length === 0) {
    writeLocalStorage(ASSET_GROUPS_KEY, DEFAULT_ASSET_GROUPS);
    return DEFAULT_ASSET_GROUPS;
  }
  return stored;
}

export function storeAssetGroups(groups: AssetGroup[]) {
  writeLocalStorage(ASSET_GROUPS_KEY, groups);
}

export function getStoredCurrencies(): Currency[] {
  const stored = readLocalStorage<Currency[] | null>(CURRENCIES_KEY, null);
  if (!stored || stored.length === 0) {
    writeLocalStorage(CURRENCIES_KEY, DEFAULT_CURRENCIES);
    return DEFAULT_CURRENCIES;
  }
  return stored;
}

export function storeCurrencies(currencies: Currency[]) {
  writeLocalStorage(CURRENCIES_KEY, currencies);
}
