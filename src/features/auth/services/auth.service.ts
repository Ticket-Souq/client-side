import { API } from '../../../shared/api';
import { fetchWithTimeout } from '../../../shared/fetchWithTimeout';
import { authFetch } from '../../../shared/auth';
import type { RegisterData, ResetPasswordData, ChangePasswordData } from '../types/auth.types';

export const AuthService = {
  async login(email: string, password: string) {
    const res = await fetchWithTimeout(API.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res;
  },

  async register(data: RegisterData) {
    const res = await fetchWithTimeout(API.auth.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res;
  },

  async sendForgotPasswordCode(email: string) {
    const res = await fetchWithTimeout(
      `${API.auth.forgotPassword}?email=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );
    return res;
  },

  async resetPassword(data: ResetPasswordData) {
    const res = await fetchWithTimeout(API.auth.forgotPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res;
  },

  async sendVerifyCode(email: string) {
    const res = await fetchWithTimeout(
      `${API.auth.verifyEmail}?email=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );
    return res;
  },

  async verifyEmail(token: string) {
    const res = await fetchWithTimeout(API.auth.verifyEmail, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: token,
    });
    return res;
  },

  async changePassword(data: ChangePasswordData) {
    const res = await authFetch(API.auth.changePassword, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },
};
