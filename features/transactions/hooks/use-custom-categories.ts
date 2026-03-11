"use client";

import { useEffect, useState } from "react";
import { Category } from "../types/transaction";
import {
  getStoredCategories,
  storeCategories,
} from "../services/category-storage.service";

type UseCategoriesValue = {
  categories: Category[];
  isLoading: boolean;
  addCategory: (category: Category) => void;
  updateCategory: (categoryUid: string, updates: Partial<Omit<Category, "uid">>) => void;
  deleteCategory: (categoryUid: string) => void;
};

export function useCategories(): UseCategoriesValue {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCategories(getStoredCategories());
    setIsLoading(false);
  }, []);

  function persist(next: Category[]) {
    storeCategories(next);
  }

  function addCategory(category: Category) {
    setCategories((prev) => {
      const next = [...prev, category];
      persist(next);
      return next;
    });
  }

  function updateCategory(
    categoryUid: string,
    updates: Partial<Omit<Category, "uid">>,
  ) {
    setCategories((prev) => {
      const next = prev.map((c) =>
        c.uid === categoryUid ? { ...c, ...updates, utime: Date.now() } : c,
      );
      persist(next);
      return next;
    });
  }

  function deleteCategory(categoryUid: string) {
    setCategories((prev) => {
      const next = prev.map((c) =>
        c.uid === categoryUid ? { ...c, isDel: true, utime: Date.now() } : c,
      );
      persist(next);
      return next;
    });
  }

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
