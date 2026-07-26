export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  OrganizationName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export type AuthTabType = 'customer' | 'organization';
