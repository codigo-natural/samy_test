import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  withCredentials: true,
});

export function getTraceIdFromAxiosError(error: unknown): string | undefined {
  const err = error as AxiosError;
  const traceId = err.response?.headers?.['x-request-id'];

  if (typeof traceId === 'string') {
    return traceId;
  }

  return undefined;
}
