export type WalletType = "cash" | "bank" | "card" | "investment" | "other";

export type WalletCurrency = "IDR" | "USD" | "EUR" | "SGD" | "OTHER";

export type WalletColor =
  | "sky"
  | "emerald"
  | "violet"
  | "rose"
  | "amber"
  | "slate";

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  currency: WalletCurrency;
  color: WalletColor;
  balance: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
};

export type WalletBalanceAdjustment = {
  walletId: string;
  amount: number;
  note: string;
  adjustedAt: string;
};
