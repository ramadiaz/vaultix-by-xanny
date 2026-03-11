import axios from "axios";
import { readLocalStorage } from "@/lib/storage/local-storage";

const authStorageKey = "vaultix.auth";
type AuthStorage = { token?: string | null };

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const stored = readLocalStorage<AuthStorage>(authStorageKey, {});
  const token = stored?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
