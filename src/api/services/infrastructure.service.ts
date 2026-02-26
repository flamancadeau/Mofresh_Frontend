import apiClient, { handleApiError } from '../client';
import type { ColdRoomEntity, CreateColdRoomDto, ColdRoomOccupancy } from '@/types/api.types';

class InfrastructureService {
  /**
   * Register a new cold storage unit
   */
  async createColdRoom(data: CreateColdRoomDto): Promise<ColdRoomEntity> {
    try {
      const response = await apiClient.post<ColdRoomEntity>('/cold-rooms', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * List cold rooms (filtered by site for managers)
   */
  async getColdRooms(siteId?: string): Promise<ColdRoomEntity[]> {
    try {
      const response = await apiClient.get<ColdRoomEntity[]>('/cold-rooms', {
        params: siteId ? { siteId } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get real-time space availability
   */
  async getColdRoomOccupancy(id: string): Promise<ColdRoomOccupancy> {
    try {
      const response = await apiClient.get<ColdRoomOccupancy>(`/cold-rooms/${id}/occupancy`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update capacity or temperature
   */
  async updateColdRoom(id: string, data: Partial<CreateColdRoomDto>): Promise<ColdRoomEntity> {
    try {
      const response = await apiClient.patch<ColdRoomEntity>(`/cold-rooms/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * List cold rooms for discovery (filtered by site)
   */
  async getDiscoveryColdRooms(siteId?: string): Promise<ColdRoomEntity[]> {
    try {
      const response = await apiClient.get<any>('/cold-rooms/discovery', {
        params: siteId ? { siteId } : {},
      });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Public: List all cold rooms
   */
  async getAllPublicColdRooms(): Promise<ColdRoomEntity[]> {
    try {
      const response = await apiClient.get<any>('/cold-rooms/all/public');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Archive/Soft-delete a cold room
   */
  async deleteColdRoom(id: string): Promise<void> {
    try {
      await apiClient.delete(`/cold-rooms/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new InfrastructureService();
