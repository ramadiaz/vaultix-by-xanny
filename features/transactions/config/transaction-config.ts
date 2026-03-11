import { CustomCategory, TransactionCategory, TransactionKind } from "../types/transaction";

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

export const BUILTIN_INCOME_CATEGORIES: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment_return",
  "gift_received",
  "other",
];

export const BUILTIN_EXPENSE_CATEGORIES: TransactionCategory[] = [
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

export const BUILTIN_CATEGORY_LABELS: Record<string, string> = {
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

export const BUILTIN_CATEGORY_ICONS: Record<string, string> = {
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

export function getCategoriesForKind(
  kind: TransactionKind,
  customCategories: CustomCategory[] = [],
): TransactionCategory[] {
  if (kind === "transfer") {
    return TRANSFER_CATEGORIES;
  }

  const builtIn =
    kind === "income" ? BUILTIN_INCOME_CATEGORIES : BUILTIN_EXPENSE_CATEGORIES;

  const custom = customCategories
    .filter((cat) => cat.kind === kind)
    .map((cat) => cat.id);

  return [...builtIn, ...custom];
}

export function getCategoryLabel(
  category: TransactionCategory,
  customCategories: CustomCategory[] = [],
): string {
  if (BUILTIN_CATEGORY_LABELS[category]) {
    return BUILTIN_CATEGORY_LABELS[category];
  }

  const custom = customCategories.find((cat) => cat.id === category);

  if (custom) {
    return custom.name;
  }

  return category;
}

export function getCategoryIcon(
  category: TransactionCategory,
  customCategories: CustomCategory[] = [],
): string {
  if (BUILTIN_CATEGORY_ICONS[category]) {
    return BUILTIN_CATEGORY_ICONS[category];
  }

  const custom = customCategories.find((cat) => cat.id === category);

  if (custom) {
    return custom.icon;
  }

  return "📌";
}
