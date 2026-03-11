import { Category, DoType } from "../types/transaction";

export const DO_TYPE_LABELS: Record<DoType, string> = {
  0: "Initialize",
  1: "Expense",
  2: "Income",
  3: "Transfer Out",
  4: "Transfer In",
};

export const DO_TYPE_KIND_MAP: Record<DoType, "income" | "expense" | "transfer" | "init"> = {
  0: "init",
  1: "expense",
  2: "income",
  3: "transfer",
  4: "transfer",
};

export const KIND_OPTIONS: { value: DoType; label: string }[] = [
  { value: 2, label: "Income" },
  { value: 1, label: "Expense" },
  { value: 3, label: "Transfer" },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { uid: "1", name: "🤑 Allowance", type: 0, status: 0, pUid: null, orderSeq: 1, isDel: false, utime: 0 },
  { uid: "2", name: "💰 Salary", type: 0, status: 0, pUid: null, orderSeq: 2, isDel: false, utime: 0 },
  { uid: "3", name: "💵 Petty cash", type: 0, status: 0, pUid: null, orderSeq: 3, isDel: false, utime: 0 },
  { uid: "4", name: "🏅 Bonus", type: 0, status: 0, pUid: null, orderSeq: 4, isDel: false, utime: 0 },
  { uid: "5", name: "Other", type: 0, status: 0, pUid: null, orderSeq: 5, isDel: false, utime: 0 },
  { uid: "55", name: "Difference", type: 0, status: 0, pUid: null, orderSeq: 6, isDel: false, utime: 0 },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { uid: "6", name: "🍜 Food", type: 1, status: 0, pUid: null, orderSeq: 1, isDel: false, utime: 0 },
  { uid: "7", name: "👬🏻 Social Life", type: 1, status: 0, pUid: null, orderSeq: 2, isDel: false, utime: 0 },
  { uid: "8", name: "🐶 Pets", type: 1, status: 0, pUid: null, orderSeq: 3, isDel: false, utime: 0 },
  { uid: "9", name: "🚖 Transport", type: 1, status: 0, pUid: null, orderSeq: 4, isDel: false, utime: 0 },
  { uid: "10", name: "🖼 Culture", type: 1, status: 0, pUid: null, orderSeq: 5, isDel: false, utime: 0 },
  { uid: "11", name: "🪑 Household", type: 1, status: 0, pUid: null, orderSeq: 6, isDel: false, utime: 0 },
  { uid: "12", name: "🧥 Apparel", type: 1, status: 0, pUid: null, orderSeq: 7, isDel: false, utime: 0 },
  { uid: "13", name: "💄 Beauty", type: 1, status: 0, pUid: null, orderSeq: 8, isDel: false, utime: 0 },
  { uid: "14", name: "🧘🏼 Health", type: 1, status: 0, pUid: null, orderSeq: 9, isDel: false, utime: 0 },
  { uid: "15", name: "📙 Education", type: 1, status: 0, pUid: null, orderSeq: 10, isDel: false, utime: 0 },
  { uid: "16", name: "🎁 Gift", type: 1, status: 0, pUid: null, orderSeq: 11, isDel: false, utime: 0 },
  { uid: "17", name: "Other", type: 1, status: 0, pUid: null, orderSeq: 12, isDel: false, utime: 0 },
  { uid: "56", name: "Difference", type: 1, status: 0, pUid: null, orderSeq: 13, isDel: false, utime: 0 },
];

export const DEFAULT_SUBCATEGORIES: Category[] = [
  { uid: "18", name: "Lunch", type: 1, status: 2, pUid: "6", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "19", name: "Dinner", type: 1, status: 2, pUid: "6", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "20", name: "Eating out", type: 1, status: 2, pUid: "6", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "21", name: "Beverages", type: 1, status: 2, pUid: "6", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "22", name: "Friend", type: 1, status: 2, pUid: "7", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "23", name: "Fellowship", type: 1, status: 2, pUid: "7", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "24", name: "Alumni", type: 1, status: 2, pUid: "7", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "25", name: "Dues", type: 1, status: 2, pUid: "7", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "26", name: "Bus", type: 1, status: 2, pUid: "9", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "27", name: "Subway", type: 1, status: 2, pUid: "9", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "28", name: "Taxi", type: 1, status: 2, pUid: "9", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "29", name: "Car", type: 1, status: 2, pUid: "9", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "30", name: "Books", type: 1, status: 2, pUid: "10", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "31", name: "Movie", type: 1, status: 2, pUid: "10", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "32", name: "Music", type: 1, status: 2, pUid: "10", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "33", name: "Apps", type: 1, status: 2, pUid: "10", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "34", name: "Appliances", type: 1, status: 2, pUid: "11", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "35", name: "Furniture", type: 1, status: 2, pUid: "11", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "36", name: "Kitchen", type: 1, status: 2, pUid: "11", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "37", name: "Toiletries", type: 1, status: 2, pUid: "11", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "38", name: "Chandlery", type: 1, status: 2, pUid: "11", orderSeq: 5, isDel: false, utime: 0 },
  { uid: "39", name: "Clothing", type: 1, status: 2, pUid: "12", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "40", name: "Fashion", type: 1, status: 2, pUid: "12", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "41", name: "Shoes", type: 1, status: 2, pUid: "12", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "42", name: "Laundry", type: 1, status: 2, pUid: "12", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "43", name: "Cosmetics", type: 1, status: 2, pUid: "13", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "44", name: "Makeup", type: 1, status: 2, pUid: "13", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "45", name: "Accessories", type: 1, status: 2, pUid: "13", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "46", name: "Beauty", type: 1, status: 2, pUid: "13", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "47", name: "Health", type: 1, status: 2, pUid: "14", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "48", name: "Yoga", type: 1, status: 2, pUid: "14", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "49", name: "Hospital", type: 1, status: 2, pUid: "14", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "50", name: "Medicine", type: 1, status: 2, pUid: "14", orderSeq: 4, isDel: false, utime: 0 },
  { uid: "51", name: "Schooling", type: 1, status: 2, pUid: "15", orderSeq: 1, isDel: false, utime: 0 },
  { uid: "52", name: "Textbooks", type: 1, status: 2, pUid: "15", orderSeq: 2, isDel: false, utime: 0 },
  { uid: "53", name: "School supplies", type: 1, status: 2, pUid: "15", orderSeq: 3, isDel: false, utime: 0 },
  { uid: "54", name: "Academy", type: 1, status: 2, pUid: "15", orderSeq: 4, isDel: false, utime: 0 },
];

export const DIFFERENCE_INCOME_CATEGORY_UID = "55";
export const DIFFERENCE_EXPENSE_CATEGORY_UID = "56";

export const ALL_DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_SUBCATEGORIES,
];

export function getCategoriesForDoType(
  doType: DoType,
  allCategories: Category[],
): Category[] {
  if (doType === 3 || doType === 4) {
    return [];
  }

  const catType = doType === 2 ? 0 : 1;
  return allCategories
    .filter((c) => c.type === catType && c.status === 0 && !c.isDel)
    .sort((a, b) => a.orderSeq - b.orderSeq);
}

export function getSubcategories(
  parentUid: string,
  allCategories: Category[],
): Category[] {
  return allCategories
    .filter((c) => c.pUid === parentUid && c.status === 2 && !c.isDel)
    .sort((a, b) => a.orderSeq - b.orderSeq);
}

export function getCategoryByUid(
  uid: string | null,
  allCategories: Category[],
): Category | undefined {
  if (!uid) return undefined;
  return allCategories.find((c) => c.uid === uid);
}

export function getCategoryDisplayName(
  uid: string | null,
  allCategories: Category[],
): string {
  if (!uid) return "";
  const category = getCategoryByUid(uid, allCategories);
  if (!category) return uid;

  if (category.status === 2 && category.pUid) {
    const parent = getCategoryByUid(category.pUid, allCategories);
    if (parent) return `${parent.name} > ${category.name}`;
  }

  return category.name;
}

export function getCategoryIcon(
  uid: string | null,
  allCategories: Category[],
): string {
  if (!uid) return "📌";
  const category = getCategoryByUid(uid, allCategories);
  if (!category) return "📌";

  const emojiMatch = category.name.match(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
  );

  if (emojiMatch) return emojiMatch[0];

  if (category.status === 2 && category.pUid) {
    return getCategoryIcon(category.pUid, allCategories);
  }

  return "📌";
}
