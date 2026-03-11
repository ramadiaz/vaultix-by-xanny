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
    let mounted = true;

    async function load() {
      const stored = await getStoredCategories();
      if (!mounted) return;
      setCategories(stored);
      setIsLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  async function persist(next: Category[]) {
    await storeCategories(next);
  }

  function addCategory(category: Category) {
    setCategories((prev) => {
      const next = [...prev, category];
      return next;
    });
    persist([...categories, category]);
  }

  function updateCategory(
    categoryUid: string,
    updates: Partial<Omit<Category, "uid">>,
  ) {
    setCategories((prev) => {
      const next = prev.map((c) =>
        c.uid === categoryUid ? { ...c, ...updates, utime: Date.now() } : c,
      );
      return next;
    });
    const next = categories.map((c) =>
      c.uid === categoryUid ? { ...c, ...updates, utime: Date.now() } : c,
    );
    persist(next);
  }

  function deleteCategory(categoryUid: string) {
    setCategories((prev) => {
      const next = prev.map((c) =>
        c.uid === categoryUid ? { ...c, isDel: true, utime: Date.now() } : c,
      );
      return next;
    });
    const next = categories.map((c) =>
      c.uid === categoryUid ? { ...c, isDel: true, utime: Date.now() } : c,
    );
    persist(next);
  }

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
