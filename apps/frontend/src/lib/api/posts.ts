import { apiClient } from './client';

export interface Post {
  id: string;
  title: string;
  body: string;
  authorUserId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createPost(payload: {
  title: string;
  body: string;
  authorUserId: number;
}): Promise<Post> {
  const res = await apiClient.post<Post>('/posts', payload);
  return res.data;
}

export async function getPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
  const res = await apiClient.get<PaginatedResponse<Post>>('/posts', { params: { page, limit } });
  return res.data;
}

export async function getPost(id: string): Promise<Post> {
  const res = await apiClient.get<Post>(`/posts/${id}`);
  return res.data;
}

export async function updatePost(
  id: string,
  payload: Partial<{ title: string; body: string; authorUserId: number }>,
): Promise<Post> {
  const res = await apiClient.patch<Post>(`/posts/${id}`, payload);
  return res.data;
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}
