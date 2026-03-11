import { apiClient } from "./client";
import { VaultixExportData } from "@/features/import-export/types/import-export";

export type BackupListItem = {
  id: string;
  name: string;
  createdAt: string;
};

export function uploadBackup(data: VaultixExportData, dateStr?: string) {
  const json = JSON.stringify(data, null, 2);
  const headers: Record<string, string> = {};
  if (dateStr) {
    headers["X-Backup-Date"] = dateStr;
  }
  return apiClient.post<{ id: string; name: string; createdAt: string }>(
    "/backups",
    json,
    {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

export function listBackups() {
  return apiClient.get<BackupListItem[]>("/backups");
}

export function downloadBackup(id: string) {
  return apiClient.get<string>(`/backups/${id}`, {
    responseType: "text",
  });
}

export function deleteBackup(id: string) {
  return apiClient.delete(`/backups/${id}`);
}
