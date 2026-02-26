import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService, usersService } from '@/api';
import type { UserEntity } from '@/types/api.types';
import { UserRole, AccountType } from '@/types/api.types';

// Map backend roles to frontend roles
const mapBackendRole = (role: UserRole): 'BUYER' | 'SITE_MANAGER' | 'ADMIN' | 'SUPPLIER' => {
  switch (role) {
    case UserRole.CLIENT:
      return 'BUYER';
    case UserRole.SITE_MANAGER:
      return 'SITE_MANAGER';
    case UserRole.SUPER_ADMIN:
      return 'ADMIN';
    case UserRole.SUPPLIER:
      return 'SUPPLIER';
    default:
      return 'BUYER';
  }
};

interface User {
  id: string;
  email: string;
  name: string;
  role: 'BUYER' | 'SITE_MANAGER' | 'ADMIN' | 'SUPPLIER';
  location: string | null;
  accountType?: 'personal' | 'business';
  firstName?: string;
  lastName?: string;
  phone?: string;
  idNumber?: string;
  tinNumber?: string;
  businessName?: string;
  isActive?: boolean;
  profilePicture?: string | null;
  siteId?: string | null;
  siteName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpEmail: string | null;
  otpRequired: boolean;
}

const savedToken = localStorage.getItem('accessToken');
const savedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
  isLoading: false,
  isAuthenticated: !!savedToken && !!savedUser,
  otpEmail: null,
  otpRequired: false,
};

// Transform backend user to frontend user
const transformUser = (backendUser: UserEntity): User => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    role: mapBackendRole(backendUser.role),
    location: backendUser.siteId || null,
    accountType: backendUser.accountType?.toLowerCase() as 'personal' | 'business',
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    phone: backendUser.phone,
    idNumber: backendUser.nationalIdDocument || undefined,
    tinNumber: backendUser.tinNumber || undefined,
    businessName: backendUser.businessName || undefined,
    isActive: backendUser.isActive,
    profilePicture: backendUser.profilePicture,
    siteId: backendUser.siteId || null,
    siteName: (backendUser as any).site?.name,
  };
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ email, password });

      // Check if OTP is required (Backend uses status: "otp_sent")
      if (response.otpRequired || (response as any).status === 'otp_sent') {
        return {
          otpRequired: true,
          email: (response as any).email || email,
        };
      }

      // CLIENT role gets tokens directly
      if (response.accessToken && response.user) {
        const transformed = transformUser(response.user);
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(transformed));

        return {
          user: transformed,
          token: response.accessToken,
          otpRequired: false,
        };
      }

      throw new Error('Invalid response from server');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ otp }: { otp: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const email = state.auth.otpEmail;

      if (!email) {
        throw new Error('No email found for OTP verification');
      }

      const response = await authService.verifyOtp({ email, code: otp });

      const transformed = transformUser(response.user);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(transformed));

      return {
        user: transformed,
        token: response.accessToken,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const email = state.auth.otpEmail;

      if (!email) {
        throw new Error('No email found for OTP resend');
      }

      await authService.resendOtp({ email });
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    {
      accountType,
      firstName,
      lastName,
      phone,
      email,
      password,
      tinNumber,
      businessName,
      nationalIdDocument,
      businessCertificateDocument,
      siteId,
      role = UserRole.CLIENT,
    }: {
      accountType?: 'personal' | 'business';
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      password: string;
      tinNumber?: string;
      businessName?: string;
      nationalIdDocument?: File;
      businessCertificateDocument?: File;
      siteId?: string;
      role?: UserRole;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = {
        email,
        firstName,
        lastName,
        phone,
        password,
        siteId,
        role,
      };

      if (accountType === 'business') {
        payload.accountType = AccountType.BUSINESS;
        payload.businessName = businessName;
        payload.tinNumber = tinNumber;
        payload.businessCertificateDocument = businessCertificateDocument;
      } else if (accountType === 'personal') {
        payload.accountType = AccountType.PERSONAL;
        payload.nationalIdDocument = nationalIdDocument;
      }

      await usersService.register(payload);

      // Return email and role for conditional OTP verification
      return { email, role };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (
    { id, userData }: { id: string; userData: any },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser = await usersService.updateUser(id, userData);
      const existingUser = localStorage.getItem('user');
      if (existingUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return transformUser(updatedUser);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpEmail = null;
      state.otpRequired = false;
    },
    setOtpEmail: (state, action: PayloadAction<string>) => {
      state.otpEmail = action.payload;
    },
    loginMock: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.token = 'mock-jwt-token';
      state.isAuthenticated = true;
      state.otpRequired = false;
      state.isLoading = false;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('accessToken', 'mock-jwt-token');
    },
    updateSiteName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.siteName = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.otpRequired) {
          state.otpRequired = true;
          state.otpEmail = action.payload.email || null;
        } else {
          state.user = action.payload.user || null;
          state.token = action.payload.token || null;
          state.isAuthenticated = true;
          state.otpRequired = false;
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpRequired = false;
        state.otpEmail = null;
      })
      .addCase(verifyOtp.rejected, (state) => {
        state.isLoading = false;
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state) => {
        state.isLoading = false;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpEmail = action.payload.email;
        state.otpRequired = action.payload.role !== UserRole.CLIENT;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpRequired = false;
        state.otpEmail = null;
      })
      .addCase(logoutUser.fulfilled, () => {
        // State already cleared in pending
      })
      .addCase(logoutUser.rejected, () => {
        // Even if the server-side logout fails, we want the user logged out locally.
        // So we keep the cleared state.
      })

      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearAuth, setOtpEmail, loginMock, updateSiteName } = authSlice.actions;
export default authSlice.reducer;