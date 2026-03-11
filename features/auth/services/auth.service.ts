import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";
import { AuthUser } from "../types/auth-user";
import { login as loginApi, register as registerApi } from "@/lib/api/auth.api";

const authStorageKey = "vaultix.auth";

type StoredAuthState = {
  user: AuthUser | null;
  token: string | null;
};

export function getStoredAuthState(): StoredAuthState {
  return readLocalStorage<StoredAuthState>(authStorageKey, {
    user: null,
    token: null,
  });
}

export function storeAuthState(state: StoredAuthState) {
  writeLocalStorage(authStorageKey, state);
}

function toAuthUser(id: string, username: string): AuthUser {
  return {
    id,
    name: username,
    email: null,
    avatarUrl: null,
  };
}

export async function loginWithCredentials(
  username: string,
  password: string,
  turnstileResponse?: string
): Promise<StoredAuthState> {
  const payload: Parameters<typeof loginApi>[0] = { username, password };
  if (turnstileResponse) payload.turnstileResponse = turnstileResponse;
  const res = await loginApi(payload);
  const { token, user } = res.data;
  const authUser = toAuthUser(user.id, user.username);
  const state: StoredAuthState = { user: authUser, token };
  storeAuthState(state);
  return state;
}

export async function registerWithCredentials(
  username: string,
  password: string,
  turnstileResponse?: string
): Promise<StoredAuthState> {
  const payload: Parameters<typeof registerApi>[0] = { username, password };
  if (turnstileResponse) payload.turnstileResponse = turnstileResponse;
  const res = await registerApi(payload);
  const { token, user } = res.data;
  const authUser = toAuthUser(user.id, user.username);
  const state: StoredAuthState = { user: authUser, token };
  storeAuthState(state);
  return state;
}

export function clearAuthState() {
  const state: StoredAuthState = { user: null, token: null };
  storeAuthState(state);
  return state;
}
