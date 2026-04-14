import { apiClient } from './client';

export type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

export interface SavedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  reqresId?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImportUserResponse {
  user: SavedUser;
  alreadyExisted: boolean;
}

export async function importUser(
  id: number,
  payload?: { role?: Role },
): Promise<ImportUserResponse> {
  const res = await apiClient.post(`/users/import/${id}`, payload ?? {});
  return res.data;
}

export async function getSavedUsers(page = 1, limit = 10): Promise<PaginatedResponse<SavedUser>> {
  const res = await apiClient.get<PaginatedResponse<SavedUser>>('/users/saved', {
    params: { page, limit },
  });
  return res.data;
}

export async function getSavedUser(id: number): Promise<SavedUser> {
  const res = await apiClient.get<SavedUser>(`/users/saved/${id}`);
  return res.data;
}

export async function deleteSavedUser(id: number): Promise<void> {
  await apiClient.delete(`/users/saved/${id}`);
}
