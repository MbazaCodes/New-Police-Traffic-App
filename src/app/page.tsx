'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { LoginPage } from '@/components/login-page';
import { RoleShell } from '@/components/role/role-shell';
import { PageRenderer } from '@/components/pages/page-renderer';

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);

  // Hydrate store from localStorage on mount
  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <RoleShell>
      <PageRenderer />
    </RoleShell>
  );
}