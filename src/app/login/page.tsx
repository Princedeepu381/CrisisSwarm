'use client';

// ─── CrisisSwarm Login Page ───────────────────────────────────────────────────
// Azure AD SSO-style authentication UI.
// Uses demo-mode: sets a localStorage session flag on sign-in.
// For production, replace with MSAL / Azure AD B2C integration.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // If already authenticated, skip login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('crisisswarm_authed');
      if (authed === 'true') {
        router.replace('/dashboard');
      } else {
        setChecked(true);
      }
    }
  }, [router]);

  const handleMicrosoftSignIn = () => {
    setLoading(true);
    // Simulate Azure AD OAuth redirect + token exchange (~1.2s)
    setTimeout(() => {
      localStorage.setItem('crisisswarm_authed', 'true');
      localStorage.setItem('crisisswarm_user', JSON.stringify({
        name: 'Incident Commander',
        email: 'admin@crisisswarm.onmicrosoft.com',
        role: 'Security Operations Lead',
        avatar: 'IC',
      }));
      router.replace('/dashboard');
    }, 1200);
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0B1220]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(0,194,255,0.15) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,194,255,0.15) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">

          {/* Microsoft header strip */}
          <div className="bg-[#0078d4] px-6 py-4 flex items-center gap-3">
            <MicrosoftLogo />
            <div>
              <p className="text-white text-sm font-semibold tracking-wide">Microsoft Azure AD</p>
              <p className="text-blue-200 text-xs">Secure Sign-In Portal</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {/* CrisisSwarm brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00C2FF] to-[#0078d4] mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl">🌪️</span>
              </div>
              <h1 className="text-xl font-bold text-white">CrisisSwarm</h1>
              <p className="text-sm text-slate-400 mt-1">AI-Powered Incident Response Platform</p>
            </div>

            {/* Sign-in prompt */}
            <div className="mb-6 text-center">
              <p className="text-slate-300 text-sm">Sign in to access your</p>
              <p className="text-white font-semibold">Security Operations Center</p>
            </div>

            {/* Tenant info */}
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                IC
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">admin@crisisswarm.onmicrosoft.com</p>
                <p className="text-slate-400 text-xs">crisisswarm.onmicrosoft.com tenant</p>
              </div>
            </div>

            {/* Sign in button */}
            <button
              id="btn-microsoft-signin"
              onClick={handleMicrosoftSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] disabled:opacity-70 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-blue-700/30 hover:shadow-blue-700/50 mb-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating with Azure AD...</span>
                </>
              ) : (
                <>
                  <MicrosoftLogo size={20} />
                  <span>Sign in with Microsoft</span>
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center mt-4">
              <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Protected by Azure Zero Trust Security</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-white/3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 CrisisSwarm</span>
            <div className="flex gap-3">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Help</span>
            </div>
          </div>
        </div>

        {/* RBAC badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span>Role-Based Access Control Active</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span>MFA Enforced</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Microsoft Logo SVG ───────────────────────────────────────────────────────

function MicrosoftLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  );
}
