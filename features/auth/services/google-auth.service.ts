import { loadGoogleIdentityScript } from "@/lib/google/load-google-script";
import { AuthUser } from "../types/auth-user";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage/local-storage";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const authStorageKey = "vaultix.auth.google";

type StoredAuthState = {
  user: AuthUser | null;
  credential: string | null;
};

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

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
  if (!clientId) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.id) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    use_fedcm_for_prompt: false,
    callback: (response) => {
      const nextState: StoredAuthState = {
        user: {
          id: "google",
          name: null,
          email: null,
          avatarUrl: null,
        },
        credential: response.credential,
      };

      storeAuthState(nextState);
      onCredential(nextState);
    },
  });
}

export function startGooglePrompt() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.google?.accounts?.id) {
    return;
  }

  window.google.accounts.id.prompt();
}

export function revokeGoogleSession(emailHint: string | null, onDone: () => void) {
  if (typeof window === "undefined") {
    onDone();
    return;
  }

  const hint = emailHint ?? "";

  if (!window.google?.accounts?.id) {
    onDone();
    return;
  }

  window.google.accounts.id.revoke(hint, () => {
    const clearedState: StoredAuthState = {
      user: null,
      credential: null,
    };

    storeAuthState(clearedState);
    onDone();
  });
}

