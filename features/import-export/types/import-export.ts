import { Transaction } from "@/features/transactions/types/transaction";
import { Wallet } from "@/features/wallets/types/wallet";
import { CustomCategory } from "@/features/transactions/types/transaction";

export type VaultixExportData = {
  version: number;
  exportedAt: string;
  wallets: Wallet[];
  transactions: Transaction[];
  customCategories: CustomCategory[];
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
  wallets: Wallet[];
  transactions: Transaction[];
  customCategories: CustomCategory[];
  summary: {
    totalWallets: number;
    totalTransactions: number;
    totalCustomCategories: number;
    skippedTransferIn: number;
  };
};
