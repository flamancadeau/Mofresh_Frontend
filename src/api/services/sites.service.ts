import apiClient, { handleApiError } from '../client';
import type {
  SiteEntity,
  CreateSiteDto,
  UpdateSiteDto,
} from '@/types/api.types';

class SitesService {
  /**
   * Get all sites
   */
  async getAllSites(): Promise<SiteEntity[]> {
    try {
      const response = await apiClient.get<any>('/sites');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get site by ID
   */
  async getSiteById(id: string): Promise<SiteEntity> {
    try {
      const response = await apiClient.get<SiteEntity>(`/sites/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new site
   */
  async createSite(siteData: CreateSiteDto): Promise<SiteEntity> {
    try {
      const response = await apiClient.post<SiteEntity>('/sites', siteData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update site details
   */
  async updateSite(id: string, siteData: UpdateSiteDto): Promise<SiteEntity> {
    try {
      const response = await apiClient.patch<SiteEntity>(`/sites/${id}`, siteData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete site
   */
  async deleteSite(id: string): Promise<void> {
    try {
      await apiClient.delete(`/sites/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new SitesService();
