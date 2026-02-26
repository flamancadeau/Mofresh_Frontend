import apiClient, { handleApiError } from '../client';
import type {
  InitiatePaymentDto,
  PaymentEntity,
  PaymentStatus,
} from '@/types/api.types';

interface PaymentFilters {
  invoiceId?: string;
  status?: PaymentStatus;
}

class PaymentsService {
  /**
   * Initiate MTN MoMo payment
   */
  async initiatePayment(data: InitiatePaymentDto): Promise<PaymentEntity> {
    try {
      const response = await apiClient.post<PaymentEntity>('/payments/momo/initiate', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Manually mark payment as paid
   */
  async markPaymentPaid(id: string): Promise<PaymentEntity> {
    try {
      const response = await apiClient.post<PaymentEntity>(`/payments/${id}/mark-paid`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentEntity> {
    try {
      const response = await apiClient.get<PaymentEntity>(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * List all payments with optional filters
   */
  async getAllPayments(filters?: PaymentFilters): Promise<PaymentEntity[]> {
    try {
      const response = await apiClient.get<PaymentEntity[]>('/payments', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new PaymentsService();
