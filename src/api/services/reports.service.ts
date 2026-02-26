import apiClient, { handleApiError } from '../client';
import type {
  RevenueReportFilters,
  UnpaidInvoicesFilters,
} from '@/types/api.types';

class ReportsService {
  /**
   * Get revenue report
   * Site Managers see only their site
   * Super Admin can see all sites or filter by site
   */
  async getRevenueReport(filters?: RevenueReportFilters): Promise<any> {
    try {
      const response = await apiClient.get('/reports/revenue', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get unpaid invoices report
   * Supports pagination and filtering
   */
  async getUnpaidInvoicesReport(filters?: UnpaidInvoicesFilters): Promise<any> {
    try {
      const response = await apiClient.get('/reports/unpaid-invoices', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ReportsService();
