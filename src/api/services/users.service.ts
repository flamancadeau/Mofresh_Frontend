import apiClient, { handleApiError, createFormData } from '../client';
import type {
  UserEntity,
  UpdateUserDto,
  RegisterClientPersonalDto,
  RegisterClientBusinessDto,
  RegisterSupplierDto,
  RegisterSiteManagerDto,
  VendorRequestDto,
  ReplyVendorRequestDto,
} from '@/types/api.types';

class UsersService {
  /**
   * Register a new user (Unified endpoint: /api/v1/users/register)
   */
  async register(userData: any): Promise<UserEntity> {
    try {
      // If it's a multipart request (contains Files), use createFormData
      const isMultipart = Object.values(userData).some(value => value instanceof File);
      const payload = isMultipart ? createFormData(userData) : userData;
      const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};

      const response = await apiClient.post<UserEntity>('/users/register', payload, { headers });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new personal client
   */
  async registerPersonalClient(data: RegisterClientPersonalDto): Promise<void> {
    try {
      const formData = createFormData(data);
      await apiClient.post('/users/register/client/personal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new business client
   */
  async registerBusinessClient(data: RegisterClientBusinessDto): Promise<void> {
    try {
      const formData = createFormData(data);
      await apiClient.post('/users/register/client/business', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new supplier
   */
  async registerSupplier(data: RegisterSupplierDto): Promise<void> {
    try {
      const formData = createFormData(data);
      await apiClient.post('/users/register/supplier', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new site manager
   */
  async registerSiteManager(data: RegisterSiteManagerDto): Promise<void> {
    try {
      await apiClient.post('/users/register/sitemanager', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new vendor (self-registration)
   */
  async registerVendor(data: RegisterSupplierDto): Promise<void> {
    try {
      const formData = createFormData(data);
      await apiClient.post('/users/register/vendor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Submit a vendor request
   */
  async submitVendorRequest(data: VendorRequestDto): Promise<void> {
    try {
      await apiClient.post('/users/vendor-request', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all vendor requests
   */
  async getVendorRequests(): Promise<(VendorRequestDto & { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string })[]> {
    try {
      const response = await apiClient.get<any>('/users/vendor-requests');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reply to a vendor request
   */
  async replyVendorRequest(data: ReplyVendorRequestDto): Promise<void> {
    try {
      await apiClient.post('/users/vendor-request/reply', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check if current user profile is complete
   */
  async checkProfileCompleteness(): Promise<{ isComplete: boolean; missingFields: string[] }> {
    try {
      const response = await apiClient.get('/users/profile/completeness');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserEntity[]> {
    try {
      const response = await apiClient.get<any>('/users');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserEntity> {
    try {
      const response = await apiClient.get<UserEntity>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user details
   */
  async updateUser(id: string, userData: UpdateUserDto): Promise<UserEntity> {
    try {
      const isMultipart = Object.values(userData).some(value => value instanceof File);
      const payload = isMultipart ? createFormData(userData) : userData;
      const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};

      const response = await apiClient.patch<UserEntity>(`/users/${id}`, payload, { headers });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new UsersService();
