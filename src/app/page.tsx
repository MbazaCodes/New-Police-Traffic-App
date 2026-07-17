'use client';

import { useAppStore } from '@/stores/app-store';
import { LoginPage } from '@/components/login-page';
import { RoleShell } from '@/components/role/role-shell';
import { PageRenderer } from '@/components/pages/page-renderer';

export default function Home() {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <RoleShell>
      <PageRenderer />
    </RoleShell>
  );
}