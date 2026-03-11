import { loadGoogleIdentityScript } from "@/lib/google/load-google-script";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const driveScope = "https://www.googleapis.com/auth/drive.file";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export function requestDriveAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!clientId || typeof window === "undefined") {
      reject(new Error("Google Drive is not configured"));
      return;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error("Google OAuth2 is not available"));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: driveScope,
          callback: (response: TokenResponse | undefined) => {
            if (response?.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error("Failed to get Drive access"));
            }
          },
        });

        client.requestAccessToken();
      })
      .catch(reject);
  });
}
