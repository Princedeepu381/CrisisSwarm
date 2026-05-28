'use client';

// ─── AuthGuard Component ──────────────────────────────────────────────────────
// Client-side auth guard. Checks localStorage for the session flag.
// Redirects unauthenticated users to /login.
// For production, replace with MSAL token validation / server-side session.

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (isPublic) {
      setAuthorized(true);
      return;
    }

    const authed = localStorage.getItem('crisisswarm_authed');
    if (authed === 'true') {
      setAuthorized(true);
    } else {
      router.replace('/login');
    }
  }, [pathname, router]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res: any) => res.json())
      .then((data: any) => {
        if (data) {
          if (data.compactMode) {
            document.documentElement.classList.add('compact-mode');
          } else {
            document.documentElement.classList.remove('compact-mode');
          }
        }
      })
      .catch((e) => console.error('Failed to load settings in AuthGuard:', e));
  }, [pathname]);

  if (!authorized) {
    // Minimal splash while redirecting — prevents flash of protected content
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00C2FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
