export type TransactionKind = "income" | "expense" | "transfer";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment_return"
  | "gift_received"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "education"
  | "travel"
  | "subscription"
  | "rent"
  | "insurance"
  | "gift_sent"
  | "transfer"
  | "other"
  | string;

export type Transaction = {
  id: string;
  walletId: string;
  targetWalletId: string | null;
  kind: TransactionKind;
  category: TransactionCategory;
  amount: number;
  fee: number;
  description: string;
  note: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomCategory = {
  id: string;
  name: string;
  icon: string;
  kind: "income" | "expense";
};
