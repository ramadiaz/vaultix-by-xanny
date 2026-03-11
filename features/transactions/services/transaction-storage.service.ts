import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Transaction } from "../types/transaction";

const transactionsStorageKey = "vaultix.transactions";

export function getStoredTransactions(): Transaction[] {
  return readLocalStorage<Transaction[]>(transactionsStorageKey, []);
}

export function storeTransactions(transactions: Transaction[]) {
  writeLocalStorage(transactionsStorageKey, transactions);
}

