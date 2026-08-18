import type { ReactNode } from 'react';
import { request } from '../http';
import { API } from '../api';
import { useFetch } from './useFetch';
import { UserProfileContext, type UserProfile } from './useUserProfileContext';

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, refresh } = useFetch(
    () => request<UserProfile>(API.users.profile),
    'Failed to load profile',
  );

  return (
    <UserProfileContext.Provider value={{ profile: data, loading, error, refresh }}>
      {children}
    </UserProfileContext.Provider>
  );
}
