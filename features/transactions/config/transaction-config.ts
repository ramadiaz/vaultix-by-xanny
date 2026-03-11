import { TransactionCategory, TransactionKind } from "../types/transaction";

export const TRANSACTION_KIND_LABELS: Record<TransactionKind, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

export const TRANSACTION_KIND_OPTIONS: TransactionKind[] = [
  "income",
  "expense",
  "transfer",
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment_return",
  "gift_received",
  "other",
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "bills",
  "health",
  "education",
  "travel",
  "subscription",
  "rent",
  "insurance",
  "gift_sent",
  "other",
];

export const TRANSFER_CATEGORIES: TransactionCategory[] = ["transfer"];

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: "Salary",
  freelance: "Freelance",
  investment_return: "Investment Return",
  gift_received: "Gift Received",
  food: "Food & Drinks",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  bills: "Bills & Utilities",
  health: "Health",
  education: "Education",
  travel: "Travel",
  subscription: "Subscription",
  rent: "Rent",
  insurance: "Insurance",
  gift_sent: "Gift Sent",
  transfer: "Transfer",
  other: "Other",
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  salary: "💰",
  freelance: "💻",
  investment_return: "📈",
  gift_received: "🎁",
  food: "🍔",
  transport: "🚗",
  shopping: "🛍️",
  entertainment: "🎬",
  bills: "📄",
  health: "🏥",
  education: "📚",
  travel: "✈️",
  subscription: "🔄",
  rent: "🏠",
  insurance: "🛡️",
  gift_sent: "🎀",
  transfer: "🔄",
  other: "📌",
};

export function getCategoriesForKind(kind: TransactionKind): TransactionCategory[] {
  if (kind === "income") {
    return INCOME_CATEGORIES;
  }

  if (kind === "transfer") {
    return TRANSFER_CATEGORIES;
  }

  return EXPENSE_CATEGORIES;
}
