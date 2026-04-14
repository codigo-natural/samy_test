import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PostForm } from './post-form';

vi.mock('@/lib/api/users', () => {
  return {
    getSavedUsers: vi.fn().mockResolvedValue({
      data: [{ id: 2, email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'VIEWER' }],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    }),
  };
});

describe('PostForm', () => {
  it('submits title/body/authorUserId', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <PostForm submitLabel="Create" onSubmit={onSubmit} />
      </QueryClientProvider>,
    );

    await user.type(screen.getByPlaceholderText('Title'), 'My title');
    await user.type(screen.getByPlaceholderText('Body'), 'Some body text');
    await user.selectOptions(await screen.findByRole('combobox'), '2');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My title',
      body: 'Some body text',
      authorUserId: 2,
    });
  });

  it('shows validation errors and does not submit when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <PostForm submitLabel="Create" onSubmit={onSubmit} />
      </QueryClientProvider>,
    );

    await screen.findByRole('combobox');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText('Min 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Min 10 characters')).toBeInTheDocument();
    expect(screen.getByText('Valid user ID required')).toBeInTheDocument();
  });
});
