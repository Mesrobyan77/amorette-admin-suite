import api from "./axios";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.logout_all"
  | "template.create"
  | "template.update"
  | "template.delete";

export interface AuditLog {
  id: string;
  action: AuditAction | string;
  actorEmail?: string;
  actorName?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
}

export const auditApi = {
  list: (params: {
    page?: number;
    limit?: number;
    action?: string;
    actor?: string;
    from?: string;
    to?: string;
  }) => api.get<AuditLogsResponse | AuditLog[]>("/api/audit-logs", { params }),
};
