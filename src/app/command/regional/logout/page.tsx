'use client';

import { useEffect } from 'react';
import { usePoliceStore } from '@/store/police-store';

/**
 * Command Regional Logout Page — performs logout on mount.
 */
export default function CommandRegionalLogoutPage() {
  const logout = usePoliceStore((s) => s.logout);

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060d1f]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2196F3] border-t-transparent" />
        <p className="mt-3 text-[13px] text-white/50">Inatoka...</p>
      </div>
    </div>
  );
}
