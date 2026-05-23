'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-cs-dark-800 text-cs-dark-50 antialiased overflow-hidden font-sans">
      {/* Sidebar - responsive layout */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Backdrop for mobile sidebar drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Top Navbar (Visible < 1024px) */}
        <header className="flex lg:hidden items-center justify-between px-6 py-4 border-b border-cs-blue-400/10 bg-cs-dark-700/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg border border-cs-blue-400/10 bg-cs-blue-500/5 text-cs-blue-400 hover:bg-cs-blue-500/15 active:scale-95 transition-all"
              aria-label="Toggle Mobile Menu"
            >
              <LucideIcons.Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-cs-blue-400">CRISIS</span>
              <span className="text-xs font-bold text-cs-dark-50">SWARM</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cs-accent-success animate-pulse" />
            <span className="text-xs font-bold text-cs-dark-50/70 tracking-wide uppercase">Command Console</span>
          </div>
        </header>

        {/* Scrollable Container */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-gradient-to-br from-cs-dark-600 via-cs-dark-700 to-cs-dark-800 transition-all duration-300
            ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
