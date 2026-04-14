export type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  requestId?: string;
  timestamp: string;
}

export interface HealthResponse {
  ok: true;
}
