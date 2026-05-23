export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter((cls): cls is string => typeof cls === 'string')
    .join(' ');
};

export const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: string } = {
    activity: 'Activity',
    'alert-triangle': 'AlertTriangle',
    cpu: 'Cpu',
    'bar-chart-2': 'BarChart2',
    settings: 'Settings',
    menu: 'Menu',
    x: 'X',
    'chevron-right': 'ChevronRight',
    'chevron-down': 'ChevronDown',
    'signal': 'Signal',
    'zap': 'Zap',
    'bell': 'Bell',
    'server': 'Server',
    'shield': 'Shield',
    'trending-up': 'TrendingUp',
  };
  return icons[iconName] || 'Circle';
};
