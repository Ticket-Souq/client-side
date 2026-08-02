import { API } from '../../../shared/api';
import { request } from '../../../shared/http';
import type {
  AuthResponse,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
} from '../types/auth.types';

export const AuthService = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>(API.auth.login, { method: 'POST', auth: false, body: { email, password } });
  },

  register(data: RegisterData): Promise<void> {
    return request<void>(API.auth.register, { method: 'POST', auth: false, body: data });
  },

  logout(): Promise<void> {
    return request<void>(API.auth.logout, { method: 'POST' });
  },

  logoutAll(): Promise<void> {
    return request<void>(API.auth.logoutAll, { method: 'POST' });
  },

  sendForgotPasswordCode(email: string): Promise<void> {
    return request<void>(`${API.auth.forgotPassword}?email=${encodeURIComponent(email)}`, { auth: false });
  },

  resetPassword(data: ResetPasswordData): Promise<void> {
    return request<void>(API.auth.forgotPassword, { method: 'POST', auth: false, body: data });
  },

  sendVerifyCode(email: string): Promise<void> {
    return request<void>(`${API.auth.verifyEmail}?email=${encodeURIComponent(email)}`, { auth: false });
  },

  verifyEmail(otp: string): Promise<void> {
    return request<void>(API.auth.verifyEmail, { method: 'POST', auth: false, body: { otp } });
  },

  changePassword(data: ChangePasswordData): Promise<void> {
    return request<void>(API.auth.changePassword, { method: 'PUT', body: data });
  },

  deactivateAccount(): Promise<void> {
    return request<void>(API.auth.deactivate, { method: 'DELETE' });
  },
};
