"use client";

import { useEffect, useState } from "react";
import { CustomCategory } from "../types/transaction";
import {
  getStoredCustomCategories,
  storeCustomCategories,
} from "../services/category-storage.service";

type UseCustomCategoriesValue = {
  customCategories: CustomCategory[];
  isLoading: boolean;
  addCategory: (category: CustomCategory) => void;
  updateCategory: (categoryId: string, updates: Partial<Omit<CustomCategory, "id">>) => void;
  deleteCategory: (categoryId: string) => void;
};

export function useCustomCategories(): UseCustomCategoriesValue {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCustomCategories(getStoredCustomCategories());
    setIsLoading(false);
  }, []);

  function persist(next: CustomCategory[]) {
    storeCustomCategories(next);
  }

  function addCategory(category: CustomCategory) {
    setCustomCategories((previous) => {
      const next = [...previous, category];
      persist(next);
      return next;
    });
  }

  function updateCategory(
    categoryId: string,
    updates: Partial<Omit<CustomCategory, "id">>,
  ) {
    setCustomCategories((previous) => {
      const next = previous.map((cat) =>
        cat.id === categoryId ? { ...cat, ...updates } : cat,
      );
      persist(next);
      return next;
    });
  }

  function deleteCategory(categoryId: string) {
    setCustomCategories((previous) => {
      const next = previous.filter((cat) => cat.id !== categoryId);
      persist(next);
      return next;
    });
  }

  return {
    customCategories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
