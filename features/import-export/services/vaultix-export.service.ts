import { getStoredAssets, getStoredAssetGroups, getStoredCurrencies } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import { VaultixExportData } from "../types/import-export";

const EXPORT_VERSION = 2;

export async function buildExportData(): Promise<VaultixExportData> {
  const [assets, assetGroups, currencies, transactions, categories] = await Promise.all([
    getStoredAssets(),
    getStoredAssetGroups(),
    getStoredCurrencies(),
    getStoredTransactions(),
    getStoredCategories(),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    assets,
    assetGroups,
    currencies,
    transactions,
    categories,
  };
}

export function downloadAsJson(data: VaultixExportData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `vaultix-backup-${dateStr}.json`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function exportVaultixBackup() {
  const data = await buildExportData();
  downloadAsJson(data);
}
