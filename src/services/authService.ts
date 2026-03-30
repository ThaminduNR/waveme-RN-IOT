import { api } from '../utils/api';
import { setToken } from '../utils/tokenStorage';

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const d = data as Record<string, unknown>;
  if (typeof d.token === 'string') {
    return d.token;
  }
  const inner = d.data;
  if (inner && typeof inner === 'object' && typeof (inner as Record<string, unknown>).token === 'string') {
    return (inner as Record<string, unknown>).token as string;
  }
  return null;
}

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<void> {
  const { data } = await api.post<unknown>('/api/auth/register', payload);
  const token = extractToken(data);
  if (!token) {
    throw new Error('No token received from server');
  }
  await setToken(token);
}

export async function login(payload: LoginPayload): Promise<void> {
  console.log('login payload', payload);
  const { data } = await api.post<unknown>('/api/auth/login', payload);
  console.log('login data', data);
  const token = extractToken(data);
 
  if (!token) {
    throw new Error('No token received from server');
  }
  await setToken(token);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email });
}

export async function verifyResetCode(email: string, code: string): Promise<void> {
  await api.post('/api/auth/verify-reset-code', { email, code });
}

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await api.post('/api/auth/reset-password', payload);
}
