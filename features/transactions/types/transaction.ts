export type TransactionKind = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  walletId: string;
  kind: TransactionKind;
  amount: number;
  description: string;
  occurredAt: string;
  createdAt: string;
};

