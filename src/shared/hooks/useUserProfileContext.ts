import { createContext, useContext } from 'react'

export interface UserProfile {
  name: string;
  email: string;
  organizationName?: string;
}

export interface UserProfileCtx {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const UserProfileContext = createContext<UserProfileCtx>({ profile: null, loading: true, error: null, refresh: async () => {} });

export function useUserProfile(): UserProfileCtx {
  return useContext(UserProfileContext);
}
