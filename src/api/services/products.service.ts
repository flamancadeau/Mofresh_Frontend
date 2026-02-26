import apiClient, { handleApiError } from '../client';
import type {
  ProductEntity,
  CreateProductDto,
  AdjustStockDto,
} from '@/types/api.types';

class ProductsService {
  /**
   * List all products with site-specific filtering
   */
  async getAllProducts(params?: { siteId?: string; category?: string }): Promise<ProductEntity[]> {
    try {
      const response = await apiClient.get<any>('/products', { params });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get detailed product information
   */
  async getProductById(id: string): Promise<ProductEntity> {
    try {
      const response = await apiClient.get<ProductEntity>(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new agricultural product
   */
  async createProduct(productData: CreateProductDto | FormData): Promise<ProductEntity> {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.post<ProductEntity>('/products', productData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update product metadata
   */
  async updateProduct(id: string, productData: Partial<CreateProductDto> | FormData): Promise<ProductEntity> {
    try {
      const isFormData = productData instanceof FormData;
      const response = await apiClient.patch<ProductEntity>(`/products/${id}`, productData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Adjust product stock levels (IN/OUT movements)
   */
  async adjustStock(id: string, data: AdjustStockDto): Promise<void> {
    try {
      await apiClient.patch(`/products/${id}/adjust-stock`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * List all products with site-specific filtering (Discovery)
   */
  async getDiscoveryProducts(siteId?: string): Promise<ProductEntity[]> {
    try {
      const response = await apiClient.get<any>('/products/discovery', { params: { siteId } });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Public: List all available products without filters
   */
  async getAllPublicProducts(): Promise<ProductEntity[]> {
    try {
      const response = await apiClient.get<any>('/products/all/public');
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get stock movements for a specific site or product
   */
  async getStockMovements(params?: { siteId?: string; productId?: string }): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/products/movements', { params });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ProductsService();
