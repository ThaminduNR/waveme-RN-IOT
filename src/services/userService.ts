import type { User } from '../types/user';
import { api } from '../utils/api';

function normalizeUser(data: unknown): User {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user profile');
  }
  const d = data as Record<string, unknown>;
  if (d.user && typeof d.user === 'object') {
    return normalizeUser(d.user);
  }
  const name = typeof d.name === 'string' ? d.name : '';
  const email = typeof d.email === 'string' ? d.email : '';
  if (!name && !email) {
    throw new Error('Invalid user profile');
  }
  const id =
    typeof d.id === 'string'
      ? d.id
      : typeof d._id === 'string'
        ? d._id
        : undefined;
  return { id, name, email };
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<unknown>('/api/users/me');
  return normalizeUser(data);
}
