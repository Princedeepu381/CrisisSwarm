'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { mainNavigation } from '@/lib/navigation';
import { useAzureHealth } from '@/hooks/useAzureData';

type IconName = keyof typeof LucideIcons;

const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> | null => {
  const icons: { [key: string]: IconName } = {
    activity: 'Activity',
    'alert-triangle': 'AlertTriangle',
    cpu: 'Cpu',
    'bar-chart-2': 'BarChart2',
    settings: 'Settings',
    menu: 'Menu',
    x: 'X',
    'chevron-right': 'ChevronRight',
    'chevron-down': 'ChevronDown',
    bell: 'Bell',
    server: 'Server',
    shield: 'Shield',
    'trending-up': 'TrendingUp',
    'cloud-cog': 'CloudCog',
  };
  
  const iconKey = icons[iconName] as IconName | undefined;
  if (!iconKey) return null;
  
  return LucideIcons[iconKey] as React.ComponentType<{ className?: string }> || null;
};

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { status, latencyMs } = useAzureHealth(30000);
  const [user, setUser] = useState<{ name: string; role: string; avatar: string } | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('crisisswarm_user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser({
          name: 'Incident Commander',
          role: 'Security Operations Lead',
          avatar: 'IC',
        });
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crisisswarm_authed');
    localStorage.removeItem('crisisswarm_user');
    window.location.href = '/login';
  };

  const azureColor =
    status === 'live'
      ? 'bg-cs-accent-success'
      : status === 'degraded'
      ? 'bg-orange-400'
      : status === 'connecting'
      ? 'bg-yellow-400'
      : 'bg-cs-dark-400';

  const azureLabel =
    status === 'live'
      ? 'Azure Live'
      : status === 'degraded'
      ? 'Degraded'
      : status === 'connecting'
      ? 'Connecting…'
      : 'Offline';

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-to-b from-cs-dark-700 via-cs-dark-800 to-cs-dark-900
        border-r border-cs-blue-400/10
        backdrop-blur-2xl bg-glass
        shadow-2xl shadow-cs-blue-400/5
      `}
    >
      {/* Visual cyber-grid subtle header embellishment */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,120,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,120,212,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Logo Section */}
      <div className="relative h-20 flex items-center justify-between px-5 border-b border-cs-blue-400/10 z-10">
        <motion.div
          className="flex items-center gap-3"
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cs-blue-500 to-cs-accent-cyan rounded-lg blur opacity-45 animate-pulse" />
            <div className="relative bg-cs-dark-800/90 px-3 py-2 rounded-lg border border-cs-blue-400/20">
              <span className="text-sm font-bold bg-gradient-to-r from-cs-blue-400 to-cs-accent-cyan bg-clip-text text-transparent">
                CS
              </span>
            </div>
          </div>
          <div className="flex flex-col select-none">
            <span className="text-[10px] tracking-[0.2em] font-extrabold text-cs-blue-400">CRISIS</span>
            <span className="text-xs tracking-wider font-bold text-cs-dark-50">SWARM</span>
          </div>
        </motion.div>

        {/* Action button container */}
        <div className="flex items-center gap-1">
          {/* Desktop Collapse Button */}
          <motion.button
            id="btn-sidebar-collapse"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-cs-blue-500/10 rounded-lg border border-transparent hover:border-cs-blue-400/20 text-cs-blue-400 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <LucideIcons.ChevronRight
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </motion.button>

          {/* Mobile Drawer Close Button */}
          <button
            id="btn-mobile-sidebar-close"
            onClick={() => setIsMobileOpen(false)}
            className="flex lg:hidden p-2 hover:bg-cs-blue-500/10 rounded-lg text-cs-blue-400 transition-colors"
            aria-label="Close Mobile Sidebar"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="relative flex-1 overflow-y-auto py-5 px-3 space-y-5 z-10 max-h-[calc(100vh-21rem)] select-none">
        {mainNavigation.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {!isCollapsed && (
              <h3 className="px-3 py-1.5 text-[10px] font-bold text-cs-dark-200/50 uppercase tracking-widest">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = getIconComponent(item.icon);
                const active = isActive(item.href);

                return (
                  <Link key={item.id} href={item.href} onClick={() => setIsMobileOpen(false)}>
                    <motion.div
                      className={`relative group px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border
                        ${
                          active
                            ? 'bg-cs-blue-500/15 border-cs-blue-400/30 text-cs-blue-300 shadow-glow-sm shadow-cs-blue-500/5'
                            : 'bg-transparent border-transparent hover:bg-cs-blue-500/5 hover:border-cs-blue-400/5 text-cs-dark-100 group-hover:text-cs-blue-400'
                        }
                      `}
                      whileHover={{ x: isCollapsed ? 0 : 3 }}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-cs-blue-400 to-cs-accent-cyan rounded-r-lg"
                          transition={{ duration: 0.25 }}
                        />
                      )}

                      <div className="flex items-center gap-3">
                        {Icon && (
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                              active ? 'text-cs-blue-400' : 'text-cs-dark-200 group-hover:text-cs-blue-400'
                            }`}
                          />
                        )}

                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-none">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-[10px] text-cs-dark-200 opacity-50 truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}

                        {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                          <motion.div
                            className="ml-auto flex-shrink-0 px-1.5 py-0.5 bg-cs-accent-danger/90 rounded text-[10px] font-bold text-white shadow-glow-sm shadow-cs-accent-danger/10"
                            animate={{
                              scale: [1, 1.08, 1],
                            }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                          >
                            {item.badge}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-cs-blue-400/10 p-4 space-y-2 bg-gradient-to-t from-cs-dark-900 to-transparent z-10 select-none">
        {/* Azure status */}
        <Link href="/azure" onClick={() => setIsMobileOpen(false)}>
          <motion.div
            className="px-3 py-2 rounded-xl border border-cs-blue-400/8 bg-cs-blue-500/5 hover:bg-cs-blue-500/10 transition-all duration-200 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${azureColor} ${status !== 'offline' ? 'animate-pulse' : ''}`} />
              <LucideIcons.CloudCog className="w-4 h-4 text-cs-blue-400 group-hover:rotate-45 transition-transform duration-300" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="text-xs text-cs-dark-100 font-semibold truncate">{azureLabel}</span>
                  {status === 'live' && latencyMs !== null && (
                    <span className="text-[10px] font-mono text-cs-accent-cyan/80 bg-cs-accent-cyan/10 px-1.5 py-0.5 rounded leading-none">
                      {latencyMs}ms
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Link>

        {/* Global status alert pill */}
        <div className="px-3 py-2 rounded-xl border border-cs-blue-400/8 bg-cs-dark-700/40 flex items-center gap-2.5">
          <div className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cs-accent-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cs-accent-success"></span>
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-cs-dark-100 font-bold uppercase tracking-wider">
              System Online
            </span>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-cs-blue-400/10 pt-3 mt-1">
          <div className="flex items-center justify-between gap-2">
            {isCollapsed ? (
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 rounded-xl border border-cs-accent-danger/20 bg-cs-accent-danger/5 hover:bg-cs-accent-danger/15 text-cs-accent-danger transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                title="Logout"
              >
                <LucideIcons.LogOut className="w-4 h-4" />
              </motion.button>
            ) : (
              <div className="flex items-center justify-between w-full bg-cs-dark-700/30 border border-cs-blue-400/5 rounded-xl p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cs-blue-500 to-cs-accent-cyan flex items-center justify-center text-xs font-bold text-white shadow-glow-sm shadow-cs-blue-500/10 flex-shrink-0">
                    {user?.avatar || 'IC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-cs-dark-50 truncate">{user?.name || 'Commander'}</p>
                    <p className="text-[10px] text-cs-dark-200 opacity-60 truncate">{user?.role || 'Ops Lead'}</p>
                  </div>
                </div>
                <motion.button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="p-2 rounded-lg border border-cs-accent-danger/20 bg-cs-accent-danger/5 hover:bg-cs-accent-danger/15 text-cs-accent-danger transition-all duration-200 flex-shrink-0 ml-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <LucideIcons.LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
