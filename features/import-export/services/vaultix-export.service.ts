import { getStoredAssets, getStoredAssetGroups, getStoredCurrencies } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCategories } from "@/features/transactions/services/category-storage.service";
import { VaultixExportData } from "../types/import-export";

const EXPORT_VERSION = 2;

export function buildExportData(): VaultixExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    assets: getStoredAssets(),
    assetGroups: getStoredAssetGroups(),
    currencies: getStoredCurrencies(),
    transactions: getStoredTransactions(),
    categories: getStoredCategories(),
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

export function exportVaultixBackup() {
  const data = buildExportData();
  downloadAsJson(data);
}
