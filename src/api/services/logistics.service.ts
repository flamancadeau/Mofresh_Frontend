import apiClient, { handleApiError } from '../client';
import type {
  TricycleEntity,
  ColdBoxEntity,
  ColdPlateEntity,
  CreateTricycleDto,
  CreateColdBoxDto,
  CreateColdPlateDto,
  AssetStatus,
} from '@/types/api.types';

class LogisticsService {
  /**
   * Tricycle Operations
   */
  async createTricycle(data: CreateTricycleDto): Promise<TricycleEntity> {
    try {
      const response = await apiClient.post<TricycleEntity>('/cold-assets/tricycles', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getTricycles(siteId?: string): Promise<TricycleEntity[]> {
    try {
      const response = await apiClient.get<TricycleEntity[]>('/cold-assets/tricycles', {
        params: { siteId },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cold Box Operations
   */
  async createColdBox(data: CreateColdBoxDto): Promise<ColdBoxEntity> {
    try {
      const response = await apiClient.post<ColdBoxEntity>('/cold-assets/boxes', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getColdBoxes(siteId?: string): Promise<ColdBoxEntity[]> {
    try {
      const response = await apiClient.get<ColdBoxEntity[]>('/cold-assets/boxes', {
        params: { siteId },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cold Plate Operations
   */
  async createColdPlate(data: CreateColdPlateDto): Promise<ColdPlateEntity> {
    try {
      const response = await apiClient.post<ColdPlateEntity>('/cold-assets/plates', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getColdPlates(siteId?: string): Promise<ColdPlateEntity[]> {
    try {
      const response = await apiClient.get<ColdPlateEntity[]>('/cold-assets/plates', {
        params: { siteId },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Shared Operations
   */
  async updateAssetStatus(type: 'tricycles' | 'boxes' | 'plates', id: string, status: AssetStatus): Promise<void> {
    try {
      await apiClient.patch(`/cold-assets/${type}/${id}/status`, { status });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteAsset(type: 'tricycles' | 'boxes' | 'plates', id: string): Promise<void> {
    try {
      await apiClient.delete(`/cold-assets/${type}/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new LogisticsService();
