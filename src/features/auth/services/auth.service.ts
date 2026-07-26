import { API } from '../../../shared/api';
import { fetchWithTimeout } from '../../../shared/fetchWithTimeout';
import { authFetch } from '../../../shared/auth';
import { parseError } from '../../../shared/apiError';
import type {
  AuthResponse,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
} from '../types/auth.types';

async function ensureOk(res: Response): Promise<never> {
  if (!res.ok) throw await parseError(res);
}

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetchWithTimeout(API.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await ensureOk(res);
    return res.json();
  },

  async register(data: RegisterData): Promise<void> {
    const res = await fetchWithTimeout(API.auth.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await ensureOk(res);
  },

  async logout(): Promise<void> {
    const res = await authFetch(API.auth.logout, { method: 'POST' });
    await ensureOk(res);
  },

  async logoutAll(): Promise<void> {
    const res = await authFetch(API.auth.logoutAll, { method: 'POST' });
    await ensureOk(res);
  },

  async sendForgotPasswordCode(email: string): Promise<void> {
    const res = await fetchWithTimeout(
      `${API.auth.forgotPassword}?email=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );
    await ensureOk(res);
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const res = await fetchWithTimeout(API.auth.forgotPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await ensureOk(res);
  },

  async sendVerifyCode(email: string): Promise<void> {
    const res = await fetchWithTimeout(
      `${API.auth.verifyEmail}?email=${encodeURIComponent(email)}`,
      { method: 'GET' }
    );
    await ensureOk(res);
  },

  async verifyEmail(otp: string): Promise<void> {
    const res = await fetchWithTimeout(API.auth.verifyEmail, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
    await ensureOk(res);
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    const res = await authFetch(API.auth.changePassword, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await ensureOk(res);
  },

  async deactivateAccount(): Promise<void> {
    const res = await authFetch(API.auth.deactivate, { method: 'DELETE' });
    await ensureOk(res);
  },
};
