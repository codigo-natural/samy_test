import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth.store';
import UsersPage from './page';

type AuthState = ReturnType<typeof useAuthStore.getState>;

const makeAuthState = (role: AuthState['role']): AuthState => ({
  isAuthenticated: true,
  email: undefined,
  role,
  setAuthenticated: vi.fn(),
  setSession: vi.fn(),
});

vi.mock('@/lib/api/users', () => {
  return {
    getSavedUsers: vi.fn().mockResolvedValue({
      data: [{ id: 1, email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'VIEWER' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
    importUser: vi.fn().mockResolvedValue({ user: {}, alreadyExisted: false }),
    deleteSavedUser: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/lib/store/auth.store', () => {
  return {
    useAuthStore: vi.fn(),
  };
});

vi.mock('@/lib/store/activity.store', () => {
  return {
    useActivityStore: (sel: any) => sel({ addEvent: vi.fn(), events: [] }),
  };
});

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders saved users and hides delete button for non-admin', async () => {
    const useAuthStoreMock = vi.mocked(useAuthStore);
    const authState = makeAuthState('VIEWER');

    useAuthStoreMock.mockImplementation(
      ((selector?: (state: AuthState) => unknown) =>
        selector ? selector(authState) : authState) as typeof useAuthStore,
    );

    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <UsersPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('a@b.com')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
  });

  it('shows delete button for admin', async () => {
    const useAuthStoreMock = vi.mocked(useAuthStore);
    const authState = makeAuthState('ADMIN');

    useAuthStoreMock.mockImplementation(
      ((selector?: (state: AuthState) => unknown) =>
        selector ? selector(authState) : authState) as typeof useAuthStore,
    );

    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <UsersPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
