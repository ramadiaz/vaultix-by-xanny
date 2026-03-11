import { buildExportData } from "@/features/import-export/services/vaultix-export.service";
import { VaultixExportData } from "@/features/import-export/types/import-export";
import { requestDriveAccessToken } from "./drive-token.service";

const VAULTIX_FILE_PREFIX = "vaultix-backup-";
const VAULTIX_MIME = "application/json";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

export type DriveBackupItem = {
  id: string;
  name: string;
  modifiedTime: string;
};

async function driveFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Drive API error: ${res.status}`);
  }

  return res;
}

export async function uploadBackupToDrive(
  accessToken: string,
  data: VaultixExportData
): Promise<string> {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `${VAULTIX_FILE_PREFIX}${dateStr}.json`;
  const json = JSON.stringify(data, null, 2);
  const boundary = "vaultix_multipart_" + Date.now();
  const metadata = JSON.stringify({
    name: fileName,
    mimeType: VAULTIX_MIME,
  });

  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${VAULTIX_MIME}\r\n\r\n` +
    `${json}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(
    `${DRIVE_UPLOAD_URL}?uploadType=multipart`,
    accessToken,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(new TextEncoder().encode(body).length),
      },
      body,
    }
  );

  const result = (await res.json()) as { id: string };
  return result.id;
}

export async function listBackupsFromDrive(
  accessToken: string
): Promise<DriveBackupItem[]> {
  const query = `name contains '${VAULTIX_FILE_PREFIX}' and mimeType='${VAULTIX_MIME}' and trashed=false`;
  const url = `${DRIVE_FILES_URL}?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)`;

  const res = await driveFetch(url, accessToken);
  const data = (await res.json()) as { files?: DriveBackupItem[] };
  return data.files ?? [];
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `${DRIVE_FILES_URL}/${fileId}?alt=media`;

  const res = await driveFetch(url, accessToken);
  return res.text();
}

export async function syncToDrive(): Promise<void> {
  const accessToken = await requestDriveAccessToken();
  const data = await buildExportData();
  await uploadBackupToDrive(accessToken, data);
}
