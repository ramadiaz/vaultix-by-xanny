import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { Transaction, Tag, TxTag } from "../types/transaction";

const TRANSACTIONS_KEY = "vaultix.transactions";
const TAGS_KEY = "vaultix.tags";
const TX_TAGS_KEY = "vaultix.tx_tags";

export function getStoredTransactions(): Transaction[] {
  return readLocalStorage<Transaction[]>(TRANSACTIONS_KEY, []);
}

export function storeTransactions(transactions: Transaction[]) {
  writeLocalStorage(TRANSACTIONS_KEY, transactions);
}

export function getStoredTags(): Tag[] {
  return readLocalStorage<Tag[]>(TAGS_KEY, []);
}

export function storeTags(tags: Tag[]) {
  writeLocalStorage(TAGS_KEY, tags);
}

export function getStoredTxTags(): TxTag[] {
  return readLocalStorage<TxTag[]>(TX_TAGS_KEY, []);
}

export function storeTxTags(txTags: TxTag[]) {
  writeLocalStorage(TX_TAGS_KEY, txTags);
}
