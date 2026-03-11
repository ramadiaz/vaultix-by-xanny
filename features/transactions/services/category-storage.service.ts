import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { CustomCategory } from "../types/transaction";

const customCategoriesKey = "vaultix.custom_categories";

export function getStoredCustomCategories(): CustomCategory[] {
  return readLocalStorage<CustomCategory[]>(customCategoriesKey, []);
}

export function storeCustomCategories(categories: CustomCategory[]) {
  writeLocalStorage(customCategoriesKey, categories);
}
