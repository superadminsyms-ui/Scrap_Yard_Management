import { apiClient } from '../client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UpdateProfileRequest,
  TwoFASetupResponse,
  TwoFAStatusResponse,
  Disable2FARequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/models'
import type { ChangePasswordRequest } from '@/types/models'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    apiClient<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiClient<User>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient<void>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  verify2FA: (tempToken: string, code: string) =>
    apiClient<LoginResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    }),

  setup2FA: () =>
    apiClient<TwoFASetupResponse>('/auth/2fa/setup'),

  activate2FA: (code: string) =>
    apiClient<{ message: string }>('/auth/2fa/activate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable2FA: (data: Disable2FARequest) =>
    apiClient<{ message: string }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get2FAStatus: () =>
    apiClient<TwoFAStatusResponse>('/auth/2fa/status'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {
      // Ignore logout errors on the server side
    }),
}
