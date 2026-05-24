import { apiClient } from '../client'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User, UpdateProfileRequest } from '@/types/models'
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
}
