import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Category } from "../types/transaction";
import { ALL_DEFAULT_CATEGORIES } from "../config/transaction-config";

const CATEGORIES_KEY = "vaultix.categories";

export function getStoredCategories(): Category[] {
  const stored = readLocalStorage<Category[] | null>(CATEGORIES_KEY, null);
  if (!stored || stored.length === 0) {
    writeLocalStorage(CATEGORIES_KEY, ALL_DEFAULT_CATEGORIES);
    return ALL_DEFAULT_CATEGORIES;
  }
  return stored;
}

export function storeCategories(categories: Category[]) {
  writeLocalStorage(CATEGORIES_KEY, categories);
}
