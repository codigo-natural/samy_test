import { apiClient } from './client';

export async function login(email: string, password: string): Promise<void> {
  await apiClient.post('/auth/login', { email, password });
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
