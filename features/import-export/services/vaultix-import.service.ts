import { storeAssets, storeAssetGroups, storeCurrencies } from "@/features/wallets/services/wallet-storage.service";
import { storeTransactions, storeTags, storeTxTags } from "@/features/transactions/services/transaction-storage.service";
import { storeCategories } from "@/features/transactions/services/category-storage.service";
import { VaultixExportData } from "../types/import-export";
import { Asset } from "@/features/wallets/types/wallet";
import { Transaction, Category } from "@/features/transactions/types/transaction";
import { MmbakImportResult } from "./mmbak-import.service";

type ImportMode = "replace" | "merge";

type VaultixImportResult = {
  assets: Asset[];
  transactions: Transaction[];
  categories: Category[];
};

export function parseVaultixJson(jsonString: string): VaultixExportData {
  const data = JSON.parse(jsonString);

  if (!data.version || (!data.assets && !data.wallets) || !data.transactions) {
    throw new Error("Invalid Vaultix backup file");
  }

  if (data.wallets && !data.assets) {
    data.assets = data.wallets;
  }

  if (data.customCategories && !data.categories) {
    data.categories = data.customCategories;
  }

  return data as VaultixExportData;
}

export function applyVaultixImport(
  data: VaultixExportData,
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): VaultixImportResult {
  if (mode === "replace") {
    storeAssets(data.assets);
    storeTransactions(data.transactions);
    storeCategories(data.categories ?? []);

    if (data.assetGroups) storeAssetGroups(data.assetGroups);
    if (data.currencies) storeCurrencies(data.currencies);

    return {
      assets: data.assets,
      transactions: data.transactions,
      categories: data.categories ?? [],
    };
  }

  const assetUidSet = new Set(existingAssets.map((a) => a.uid));
  const newAssets = data.assets.filter((a) => !assetUidSet.has(a.uid));
  const mergedAssets = [...existingAssets, ...newAssets];

  const txnUidSet = new Set(existingTransactions.map((t) => t.uid));
  const newTransactions = data.transactions.filter((t) => !txnUidSet.has(t.uid));
  const mergedTransactions = [...existingTransactions, ...newTransactions];

  const catUidSet = new Set(existingCategories.map((c) => c.uid));
  const incoming = data.categories ?? [];
  const newCategories = incoming.filter((c) => !catUidSet.has(c.uid));
  const mergedCategories = [...existingCategories, ...newCategories];

  storeAssets(mergedAssets);
  storeTransactions(mergedTransactions);
  storeCategories(mergedCategories);

  return {
    assets: mergedAssets,
    transactions: mergedTransactions,
    categories: mergedCategories,
  };
}

export function applyMoneyManagerImport(
  assets: Asset[],
  transactions: Transaction[],
  categories: Category[],
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): VaultixImportResult {
  if (mode === "replace") {
    storeAssets(assets);
    storeTransactions(transactions);
    storeCategories(categories);

    return { assets, transactions, categories };
  }

  const exAssetSet = new Set(existingAssets.map((a) => a.uid));
  const mmNewAssets = assets.filter((a) => !exAssetSet.has(a.uid));
  const mmMergedAssets = [...existingAssets, ...mmNewAssets];

  const mmMergedTxns = [...existingTransactions, ...transactions];

  const exCatSet = new Set(existingCategories.map((c) => c.uid));
  const mmNewCats = categories.filter((c) => !exCatSet.has(c.uid));
  const mmMergedCats = [...existingCategories, ...mmNewCats];

  storeAssets(mmMergedAssets);
  storeTransactions(mmMergedTxns);
  storeCategories(mmMergedCats);

  return {
    assets: mmMergedAssets,
    transactions: mmMergedTxns,
    categories: mmMergedCats,
  };
}

export function applyMmbakImport(
  data: MmbakImportResult,
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): VaultixImportResult {
  if (mode === "replace") {
    storeAssets(data.assets);
    storeTransactions(data.transactions);
    storeCategories(data.categories);

    if (data.assetGroups.length > 0) storeAssetGroups(data.assetGroups);
    if (data.currencies.length > 0) storeCurrencies(data.currencies);
    if (data.tags.length > 0) storeTags(data.tags);
    if (data.txTags.length > 0) storeTxTags(data.txTags);

    return {
      assets: data.assets,
      transactions: data.transactions,
      categories: data.categories,
    };
  }

  const bakAssetSet = new Set(existingAssets.map((a) => a.uid));
  const bakNewAssets = data.assets.filter((a) => !bakAssetSet.has(a.uid));
  const bakMergedAssets = [...existingAssets, ...bakNewAssets];

  const bakTxnSet = new Set(existingTransactions.map((t) => t.uid));
  const bakNewTxns = data.transactions.filter((t) => !bakTxnSet.has(t.uid));
  const bakMergedTxns = [...existingTransactions, ...bakNewTxns];

  const bakCatSet = new Set(existingCategories.map((c) => c.uid));
  const bakNewCats = data.categories.filter((c) => !bakCatSet.has(c.uid));
  const bakMergedCats = [...existingCategories, ...bakNewCats];

  storeAssets(bakMergedAssets);
  storeTransactions(bakMergedTxns);
  storeCategories(bakMergedCats);

  if (data.assetGroups.length > 0) storeAssetGroups(data.assetGroups);
  if (data.currencies.length > 0) storeCurrencies(data.currencies);
  if (data.tags.length > 0) storeTags(data.tags);
  if (data.txTags.length > 0) storeTxTags(data.txTags);

  return {
    assets: bakMergedAssets,
    transactions: bakMergedTxns,
    categories: bakMergedCats,
  };
}
