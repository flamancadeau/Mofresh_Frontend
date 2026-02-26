import apiClient, { handleApiError } from '../client';

class SeederService {
  /**
   * Manually trigger database seeding
   * Only accessible by Super Admins
   */
  async seedDatabase(): Promise<any> {
    try {
      const response = await apiClient.post('/seeder/seed');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new SeederService();
