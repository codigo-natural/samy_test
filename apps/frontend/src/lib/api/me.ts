import { apiClient } from './client';
import axios from 'axios';

export interface MeResponse {
  email?: string;
  role?: string;
}

export async function getMe(): Promise<MeResponse | null> {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      return null;
    }
    throw e;
  }
}
