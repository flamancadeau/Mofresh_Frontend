import apiClient, { handleApiError } from '../client';
import type {
  AuditLogEntity,
  CreateAuditLogDto,
} from '@/types/api.types';

class AuditService {
  /**
   * Create a new audit log entry
   */
  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLogEntity> {
    try {
      const response = await apiClient.post<AuditLogEntity>('/audit-logs', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all audit logs
   */
  async getAuditLogs(): Promise<AuditLogEntity[]> {
    try {
      const response = await apiClient.get<AuditLogEntity[]>('/audit-logs');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new AuditService();
