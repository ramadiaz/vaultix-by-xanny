import { apiClient } from "./client";
import { VaultixExportData } from "@/features/import-export/types/import-export";
import { SyncDelta } from "@/features/sync/services/delta.service";

type SyncResponse = {
  data: VaultixExportData;
};

export function sync(delta: SyncDelta): Promise<VaultixExportData> {
  return apiClient
    .post<SyncResponse>("/sync", { delta })
    .then((res) => res.data.data);
}
