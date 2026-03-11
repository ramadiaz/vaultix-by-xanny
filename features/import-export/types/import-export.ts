import { Transaction, Category } from "@/features/transactions/types/transaction";
import { Asset, AssetGroup, Currency } from "@/features/wallets/types/wallet";

export type VaultixExportData = {
  version: number;
  exportedAt: string;
  assets: Asset[];
  assetGroups: AssetGroup[];
  currencies: Currency[];
  transactions: Transaction[];
  categories: Category[];
};

export type MoneyManagerRow = {
  date: string;
  account: string;
  category: string;
  subcategory: string;
  note: string;
  amountIDR: number;
  type: "Income" | "Expense" | "Transfer-Out" | "Transfer-In";
  description: string;
  amount: number;
  currency: string;
};

export type ImportResult = {
  assets: Asset[];
  transactions: Transaction[];
  categories: Category[];
  summary: {
    totalAssets: number;
    totalTransactions: number;
    totalCategories: number;
    skippedTransferIn: number;
  };
};
