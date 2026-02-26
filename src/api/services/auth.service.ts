import apiClient, { handleApiError } from '../client';
import type {
  LoginDto,
  LoginResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  ResendOtpDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '@/types/api.types';

class AuthService {
  /**
   * Login with email and password
   * Returns OTP requirement for non-CLIENT roles or tokens for CLIENT role
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify OTP and get JWT tokens
   */
  async verifyOtp(data: VerifyOtpDto): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resend OTP if expired or not received
   */
  async resendOtp(data: ResendOtpDto): Promise<void> {
    try {
      await apiClient.post('/auth/resend-otp', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post('/auth/refresh');

      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(): Promise<void> {
    // Clear local storage immediately for responsive UI
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    }
  }

  /**
   * Request password reset - sends OTP to email
   */
  async requestPasswordReset(data: RequestPasswordResetDto): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
