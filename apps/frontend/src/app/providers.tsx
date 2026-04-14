'use client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

import { getMe } from '@/lib/api/me';
import { useAuthStore } from '@/lib/store/auth.store';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionHydrator />
      {children}
    </QueryClientProvider>
  );
}

function SessionHydrator() {
  const setSession = useAuthStore((s) => s.setSession);
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (me !== undefined) {
      setSession(me ?? null);
    }
  }, [me, setSession]);

  return null;
}
