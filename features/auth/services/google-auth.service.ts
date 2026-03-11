import { loadGoogleIdentityScript } from "@/lib/google/load-google-script";
import { AuthUser } from "../types/auth-user";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const authStorageKey = "vaultix.auth.google";
const driveScope = "https://www.googleapis.com/auth/drive.file";
const signInScopes = `openid email profile ${driveScope}`;

type StoredAuthState = {
  user: AuthUser | null;
  credential: string | null;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse | undefined) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, callback: (done: { successful: boolean }) => void) => void;
        };
      };
    };
  }
}

async function fetchUserInfo(accessToken: string): Promise<AuthUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }

  const data = (await res.json()) as {
    id: string;
    name?: string;
    email?: string;
    picture?: string;
  };

  return {
    id: data.id ?? "google",
    name: data.name ?? null,
    email: data.email ?? null,
    avatarUrl: data.picture ?? null,
  };
}

let tokenClient: { requestAccessToken: (overrideConfig?: { prompt?: string }) => void } | null = null;

export function getStoredAuthState(): StoredAuthState {
  return readLocalStorage<StoredAuthState>(authStorageKey, {
    user: null,
    credential: null,
  });
}

export function storeAuthState(state: StoredAuthState) {
  writeLocalStorage(authStorageKey, state);
}

export async function initializeGoogleIdentity(
  onCredential: (state: StoredAuthState) => void,
): Promise<void> {
  if (!clientId || typeof window === "undefined") {
    return;
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: signInScopes,
    callback: async (response: TokenResponse | undefined) => {
      if (!response?.access_token) {
        return;
      }

      try {
        const user = await fetchUserInfo(response.access_token);
        const nextState: StoredAuthState = {
          user,
          credential: response.access_token,
        };

        storeAuthState(nextState);
        onCredential(nextState);
      } catch {
        onCredential({ user: null, credential: null });
      }
    },
  });
}

export function startGooglePrompt() {
  if (typeof window === "undefined" || !tokenClient) {
    return;
  }

  tokenClient.requestAccessToken();
}

export function revokeGoogleSession(_emailHint: string | null, onDone: () => void) {
  if (typeof window === "undefined") {
    onDone();
    return;
  }

  const state = getStoredAuthState();

  if (state.credential && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(state.credential, () => {
      const clearedState: StoredAuthState = { user: null, credential: null };
      storeAuthState(clearedState);
      onDone();
    });
    return;
  }

  const clearedState: StoredAuthState = { user: null, credential: null };
  storeAuthState(clearedState);
  onDone();
}
