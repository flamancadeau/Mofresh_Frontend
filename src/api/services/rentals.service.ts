import apiClient, { handleApiError } from '../client';
import type {
  RentalEntity,
  CreateRentalDto,
  RentalStatus,
  AssetType,
} from '@/types/api.types';

class RentalsService {
  /**
   * Request a rental
   */
  async createRental(rentalData: CreateRentalDto): Promise<RentalEntity> {
    try {
      const response = await apiClient.post<RentalEntity>('/rentals', rentalData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all rentals with pagination and filtering
   */
  async getRentals(params?: { siteId?: string; status?: RentalStatus; page?: number; limit?: number }): Promise<RentalEntity[]> {
    try {
      const response = await apiClient.get<RentalEntity[]>('/rentals', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get rental by ID
   */
  async getRentalById(id: string): Promise<RentalEntity> {
    try {
      const response = await apiClient.get<RentalEntity>(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get available assets by type for rental
   */
  async getAvailableAssets(assetType: AssetType): Promise<any[]> {
    try {
      const response = await apiClient.get('/rentals/available-assets', {
        params: { assetType },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approve a rental request
   */
  async approveRental(id: string): Promise<void> {
    try {
      await apiClient.patch(`/rentals/${id}/approve`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Activate a rental
   */
  async activateRental(id: string): Promise<void> {
    try {
      await apiClient.patch(`/rentals/${id}/activate`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete a rental
   */
  async completeRental(id: string): Promise<void> {
    try {
      await apiClient.patch(`/rentals/${id}/complete`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel a rental
   */
  async cancelRental(id: string): Promise<void> {
    try {
      await apiClient.patch(`/rentals/${id}/cancel`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new RentalsService();
