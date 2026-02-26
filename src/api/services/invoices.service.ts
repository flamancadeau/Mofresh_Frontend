import apiClient, { handleApiError } from '../client';
import type {
  InvoiceResponseDto,
  GenerateOrderInvoiceDto,
  GenerateRentalInvoiceDto,
  MarkPaidDto,
  VoidInvoiceDto,
  InvoiceStatus,
} from '@/types/api.types';

interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  siteId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class InvoicesService {
  /**
   * Generate invoice for an approved order
   */
  async generateOrderInvoice(data: GenerateOrderInvoiceDto): Promise<InvoiceResponseDto> {
    try {
      const response = await apiClient.post<InvoiceResponseDto>('/invoices/generate/order', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate invoice for an approved rental
   */
  async generateRentalInvoice(data: GenerateRentalInvoiceDto): Promise<InvoiceResponseDto> {
    try {
      const response = await apiClient.post<InvoiceResponseDto>('/invoices/generate/rental', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all invoices with optional filters
   */
  async getAllInvoices(filters?: InvoiceFilters): Promise<InvoiceResponseDto[]> {
    try {
      const response = await apiClient.get<InvoiceResponseDto[]>('/invoices', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    try {
      const response = await apiClient.get<InvoiceResponseDto>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceResponseDto> {
    try {
      const response = await apiClient.get<InvoiceResponseDto>(`/invoices/number/${invoiceNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark invoice as paid (manual payment)
   */
  async markInvoicePaid(id: string, data: MarkPaidDto): Promise<InvoiceResponseDto> {
    try {
      const response = await apiClient.patch<InvoiceResponseDto>(`/invoices/${id}/mark-paid`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Void an invoice
   */
  async voidInvoice(id: string, data: VoidInvoiceDto): Promise<void> {
    try {
      await apiClient.patch(`/invoices/${id}/void`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new InvoicesService();
