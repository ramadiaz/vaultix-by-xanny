import { buildExportData } from "@/features/import-export/services/vaultix-export.service";
import {
  uploadBackup,
  listBackups,
  downloadBackup,
  BackupListItem,
} from "@/lib/api/backup.api";

export type BackupItem = BackupListItem;

export async function syncToBackupServer(): Promise<void> {
  const data = await buildExportData();
  const dateStr = data.exportedAt.split("T")[0];
  await uploadBackup(data, dateStr);
}

export async function fetchBackupsFromServer(): Promise<BackupItem[]> {
  const res = await listBackups();
  return res.data;
}

export async function downloadBackupFromServer(id: string): Promise<string> {
  const res = await downloadBackup(id);
  return res.data;
}
