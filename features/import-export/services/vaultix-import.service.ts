import { storeWallets } from "@/features/wallets/services/wallet-storage.service";
import { storeTransactions } from "@/features/transactions/services/transaction-storage.service";
import { storeCustomCategories } from "@/features/transactions/services/category-storage.service";
import { VaultixExportData } from "../types/import-export";
import { Wallet } from "@/features/wallets/types/wallet";
import { Transaction, CustomCategory } from "@/features/transactions/types/transaction";

type ImportMode = "replace" | "merge";

type VaultixImportResult = {
  wallets: Wallet[];
  transactions: Transaction[];
  customCategories: CustomCategory[];
};

export function parseVaultixJson(jsonString: string): VaultixExportData {
  const data = JSON.parse(jsonString);

  if (!data.version || !data.wallets || !data.transactions) {
    throw new Error("Invalid Vaultix backup file");
  }

  return data as VaultixExportData;
}

export function applyVaultixImport(
  data: VaultixExportData,
  mode: ImportMode,
  existingWallets: Wallet[],
  existingTransactions: Transaction[],
  existingCustomCategories: CustomCategory[],
): VaultixImportResult {
  if (mode === "replace") {
    storeWallets(data.wallets);
    storeTransactions(data.transactions);
    storeCustomCategories(data.customCategories ?? []);

    return {
      wallets: data.wallets,
      transactions: data.transactions,
      customCategories: data.customCategories ?? [],
    };
  }

  const walletIdSet = new Set(existingWallets.map((w) => w.id));
  const newWallets = data.wallets.filter((w) => !walletIdSet.has(w.id));
  const mergedWallets = [...existingWallets, ...newWallets];

  const txnIdSet = new Set(existingTransactions.map((t) => t.id));
  const newTransactions = data.transactions.filter((t) => !txnIdSet.has(t.id));
  const mergedTransactions = [...existingTransactions, ...newTransactions];

  const catIdSet = new Set(existingCustomCategories.map((c) => c.id));
  const incoming = data.customCategories ?? [];
  const newCategories = incoming.filter((c) => !catIdSet.has(c.id));
  const mergedCategories = [...existingCustomCategories, ...newCategories];

  storeWallets(mergedWallets);
  storeTransactions(mergedTransactions);
  storeCustomCategories(mergedCategories);

  return {
    wallets: mergedWallets,
    transactions: mergedTransactions,
    customCategories: mergedCategories,
  };
}

export function applyMoneyManagerImport(
  wallets: Wallet[],
  transactions: Transaction[],
  customCategories: CustomCategory[],
  mode: ImportMode,
  existingWallets: Wallet[],
  existingTransactions: Transaction[],
  existingCustomCategories: CustomCategory[],
): VaultixImportResult {
  if (mode === "replace") {
    storeWallets(wallets);
    storeTransactions(transactions);
    storeCustomCategories(customCategories);

    return { wallets, transactions, customCategories };
  }

  const walletIdSet = new Set(existingWallets.map((w) => w.id));
  const newWallets = wallets.filter((w) => !walletIdSet.has(w.id));
  const mergedWallets = [...existingWallets, ...newWallets];

  const mergedTransactions = [...existingTransactions, ...transactions];

  const catIdSet = new Set(existingCustomCategories.map((c) => c.id));
  const newCategories = customCategories.filter((c) => !catIdSet.has(c.id));
  const mergedCategories = [...existingCustomCategories, ...newCategories];

  storeWallets(mergedWallets);
  storeTransactions(mergedTransactions);
  storeCustomCategories(mergedCategories);

  return {
    wallets: mergedWallets,
    transactions: mergedTransactions,
    customCategories: mergedCategories,
  };
}
