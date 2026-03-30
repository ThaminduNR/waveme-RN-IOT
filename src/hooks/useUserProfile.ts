import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { User } from '../types/user';
import { getMe } from '../services/userService';
import { getErrorMessage } from '../utils/apiError';

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getMe();
      setUser(profile);
    } catch (e) {
      setError(getErrorMessage(e));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { user, loading, error, refetch: load };
}
