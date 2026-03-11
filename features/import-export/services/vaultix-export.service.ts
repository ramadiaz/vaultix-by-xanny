import { getStoredWallets } from "@/features/wallets/services/wallet-storage.service";
import { getStoredTransactions } from "@/features/transactions/services/transaction-storage.service";
import { getStoredCustomCategories } from "@/features/transactions/services/category-storage.service";
import { VaultixExportData } from "../types/import-export";

const EXPORT_VERSION = 1;

export function buildExportData(): VaultixExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    wallets: getStoredWallets(),
    transactions: getStoredTransactions(),
    customCategories: getStoredCustomCategories(),
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
