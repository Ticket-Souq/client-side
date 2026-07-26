import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authFetch } from '../auth';
import { API } from '../api';

export interface UserProfile {
  name: string;
  email: string;
  organizationName?: string;
}

interface UserProfileCtx {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const Ctx = createContext<UserProfileCtx>({ profile: null, loading: true, error: null, refresh: () => {} });

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    authFetch(API.users.profile)
      .then(res => {
        if (cancelled) return;
        if (res.ok) return res.json();
        throw new Error('Failed to load profile');
      })
      .then(data => { if (!cancelled) setProfile(data); })
      .catch(() => { if (!cancelled) setError('Failed to load profile'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = fetchProfile();
    return cleanup;
  }, [fetchProfile]);

  return (
    <Ctx.Provider value={{ profile, loading, error, refresh: fetchProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUserProfile(): UserProfileCtx {
  return useContext(Ctx);
}
