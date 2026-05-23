import { MenuItem } from '@/types';

export const mainNavigation: MenuItem[] = [
  {
    label: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'activity',
        description: 'Real-time monitoring',
      },
      {
        id: 'incidents',
        label: 'Incidents',
        href: '/incidents',
        icon: 'alert-triangle',
        badge: 0,
        description: 'Live incidents feed',
      },
      {
        id: 'agents',
        label: 'AI Swarm',
        href: '/agents',
        icon: 'cpu',
        description: 'Autonomous agents',
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: 'bar-chart-2',
        description: 'Performance metrics',
      },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      {
        id: 'azure',
        label: 'Azure Integration',
        href: '/azure',
        icon: 'cloud-cog',
        description: 'Live backend · App Service',
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: 'settings',
        description: 'System settings',
      },
    ],
  },
];

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

export const getSeverityBgColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/10';
    case 'high':
      return 'bg-orange-500/10';
    case 'medium':
      return 'bg-yellow-500/10';
    case 'low':
      return 'bg-blue-400/10';
    default:
      return 'bg-gray-500/10';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'investigating':
      return 'text-yellow-400 animate-pulse';
    case 'resolved':
      return 'text-green-400';
    case 'idle':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
