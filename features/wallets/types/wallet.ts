export type WalletType = "cash" | "bank" | "card" | "investment" | "other";

export type WalletCurrency = "IDR" | "USD" | "EUR" | "SGD" | "OTHER";

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  currency: WalletCurrency;
  balance: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
};

