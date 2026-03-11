import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Asset, AssetGroup, Currency } from "../types/wallet";
import { DEFAULT_ASSET_GROUPS, DEFAULT_CURRENCIES } from "../config/wallet-config";

const ASSETS_KEY = "vaultix.assets";
const ASSET_GROUPS_KEY = "vaultix.asset_groups";
const CURRENCIES_KEY = "vaultix.currencies";

export function getStoredAssets(): Asset[] {
  return readLocalStorage<Asset[]>(ASSETS_KEY, []);
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
