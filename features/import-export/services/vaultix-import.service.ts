import { storeAssets, storeAssetGroups, storeCurrencies } from "@/features/wallets/services/wallet-storage.service";
import { storeTransactions, storeTags, storeTxTags } from "@/features/transactions/services/transaction-storage.service";
import { storeCategories } from "@/features/transactions/services/category-storage.service";
import { persistDatabase } from "@/lib/storage/sqlite-database";
import { clearDeletedUidsPresentIn } from "@/features/sync/services/pending-sync.service";

const BATCH = { skipPersist: true };
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

export async function applyVaultixImport(
  data: VaultixExportData,
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): Promise<VaultixImportResult> {
  if (mode === "replace") {
    await Promise.all([
      storeAssets(data.assets, BATCH),
      storeTransactions(data.transactions, BATCH),
      storeCategories(data.categories ?? [], BATCH),
    ]);
    if (data.assetGroups) await storeAssetGroups(data.assetGroups, BATCH);
    if (data.currencies) await storeCurrencies(data.currencies, BATCH);
    await persistDatabase();

    clearDeletedUidsPresentIn(
      data.transactions.map((t) => t.uid),
      data.assets.map((a) => a.uid),
      (data.categories ?? []).map((c) => c.uid)
    );

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

  await Promise.all([
    storeAssets(mergedAssets, BATCH),
    storeTransactions(mergedTransactions, BATCH),
    storeCategories(mergedCategories, BATCH),
  ]);
  await persistDatabase();

  return {
    assets: mergedAssets,
    transactions: mergedTransactions,
    categories: mergedCategories,
  };
}

export async function applyMoneyManagerImport(
  assets: Asset[],
  transactions: Transaction[],
  categories: Category[],
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): Promise<VaultixImportResult> {
  if (mode === "replace") {
    await Promise.all([
      storeAssets(assets, BATCH),
      storeTransactions(transactions, BATCH),
      storeCategories(categories, BATCH),
    ]);
    await persistDatabase();

    return { assets, transactions, categories };
  }

  const exAssetSet = new Set(existingAssets.map((a) => a.uid));
  const mmNewAssets = assets.filter((a) => !exAssetSet.has(a.uid));
  const mmMergedAssets = [...existingAssets, ...mmNewAssets];

  const mmMergedTxns = [...existingTransactions, ...transactions];

  const exCatSet = new Set(existingCategories.map((c) => c.uid));
  const mmNewCats = categories.filter((c) => !exCatSet.has(c.uid));
  const mmMergedCats = [...existingCategories, ...mmNewCats];

  await Promise.all([
    storeAssets(mmMergedAssets, BATCH),
    storeTransactions(mmMergedTxns, BATCH),
    storeCategories(mmMergedCats, BATCH),
  ]);
  await persistDatabase();

  return {
    assets: mmMergedAssets,
    transactions: mmMergedTxns,
    categories: mmMergedCats,
  };
}

export async function applyMmbakImport(
  data: MmbakImportResult,
  mode: ImportMode,
  existingAssets: Asset[],
  existingTransactions: Transaction[],
  existingCategories: Category[],
): Promise<VaultixImportResult> {
  if (mode === "replace") {
    await Promise.all([
      storeAssets(data.assets, BATCH),
      storeTransactions(data.transactions, BATCH),
      storeCategories(data.categories, BATCH),
    ]);
    if (data.assetGroups.length > 0) await storeAssetGroups(data.assetGroups, BATCH);
    if (data.currencies.length > 0) await storeCurrencies(data.currencies, BATCH);
    if (data.tags.length > 0) await storeTags(data.tags, BATCH);
    if (data.txTags.length > 0) await storeTxTags(data.txTags, BATCH);
    await persistDatabase();

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

  await Promise.all([
    storeAssets(bakMergedAssets, BATCH),
    storeTransactions(bakMergedTxns, BATCH),
    storeCategories(bakMergedCats, BATCH),
  ]);
  if (data.assetGroups.length > 0) await storeAssetGroups(data.assetGroups, BATCH);
  if (data.currencies.length > 0) await storeCurrencies(data.currencies, BATCH);
  if (data.tags.length > 0) await storeTags(data.tags, BATCH);
  if (data.txTags.length > 0) await storeTxTags(data.txTags, BATCH);
  await persistDatabase();

  return {
    assets: bakMergedAssets,
    transactions: bakMergedTxns,
    categories: bakMergedCats,
  };
}
