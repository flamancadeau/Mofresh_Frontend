import apiClient, { handleApiError } from '../client';
import type {
  OrderEntity,
  CreateOrderDto,
  OrderStatus,
} from '@/types/api.types';

class OrdersService {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderDto): Promise<OrderEntity> {
    try {
      const response = await apiClient.post<OrderEntity>('/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all orders with pagination and filtering
   */
  async getAllOrders(params?: { status?: OrderStatus; page?: number; limit?: number }): Promise<OrderEntity[]> {
    try {
      const response = await apiClient.get<OrderEntity[]>('/orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<OrderEntity> {
    try {
      const response = await apiClient.get<OrderEntity>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete an order (only REQUESTED orders)
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      await apiClient.delete(`/orders/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approving orders
   */
  async approveOrder(id: string): Promise<void> {
    try {
      await apiClient.patch(`/orders/${id}/approve`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Rejecting orders
   */
  async rejectOrder(id: string, rejectionReason: string): Promise<void> {
    try {
      await apiClient.patch(`/orders/${id}/reject`, { rejectionReason });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus, params?: { page?: number; limit?: number }): Promise<OrderEntity[]> {
    try {
      const response = await apiClient.get<OrderEntity[]>(`/orders/status/${status}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new OrdersService();
