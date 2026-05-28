'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] p-6 text-center">
      <div className="p-4 rounded-full bg-cs-accent-danger/10 border border-cs-accent-danger/20 text-cs-accent-danger mb-6 animate-pulse">
        <LucideIcons.ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-cs-dark-50 tracking-wider mb-2 uppercase font-mono">
        404 - SECURE LINK CORRUPT
      </h1>
      <p className="text-sm text-cs-dark-200 opacity-75 max-w-md mb-8">
        The requested operations endpoint or monitoring coordinate does not exist. Traffic has been diverted to secure command center routes.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-cs-blue-500/20 hover:bg-cs-blue-500/30 text-cs-blue-400 border border-cs-blue-400/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 mx-auto w-fit"
      >
        <LucideIcons.ArrowLeft className="w-4 h-4" />
        Return to Command Center
      </Link>
    </div>
  );
}
