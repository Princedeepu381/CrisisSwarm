'use client';

interface StatusBadgeProps {
  status: 'active' | 'idle' | 'investigating' | 'resolved' | 'critical' | 'warning' | 'success';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}



const statusConfig: {
  [key: string]: {
    color: string;
    bgColor: string;
    dotColor: string;
    icon: string;
    label: string;
  };
} = {
  active: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    dotColor: 'bg-yellow-400',
    icon: 'alert-circle',
    label: 'Active',
  },
  idle: {
    color: 'text-cs-dark-200',
    bgColor: 'bg-cs-dark-200/10',
    dotColor: 'bg-cs-dark-200',
    icon: 'clock',
    label: 'Idle',
  },
  investigating: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    dotColor: 'bg-blue-400',
    icon: 'zap',
    label: 'Investigating',
  },
  resolved: {
    color: 'text-cs-accent-success',
    bgColor: 'bg-cs-accent-success/10',
    dotColor: 'bg-cs-accent-success',
    icon: 'check-circle',
    label: 'Resolved',
  },
  critical: {
    color: 'text-cs-accent-danger',
    bgColor: 'bg-cs-accent-danger/10',
    dotColor: 'bg-cs-accent-danger',
    icon: 'alert-circle',
    label: 'Critical',
  },
  warning: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    dotColor: 'bg-orange-400',
    icon: 'alert-circle',
    label: 'Warning',
  },
  success: {
    color: 'text-cs-accent-success',
    bgColor: 'bg-cs-accent-success/10',
    dotColor: 'bg-cs-accent-success',
    icon: 'check-circle',
    label: 'Success',
  },
};

const sizeConfig: { [key: string]: { padding: string; textSize: string; dotSize: string } } = {
  sm: {
    padding: 'px-2 py-1',
    textSize: 'text-xs',
    dotSize: 'w-1.5 h-1.5',
  },
  md: {
    padding: 'px-3 py-1.5',
    textSize: 'text-sm',
    dotSize: 'w-2 h-2',
  },
  lg: {
    padding: 'px-4 py-2',
    textSize: 'text-base',
    dotSize: 'w-2.5 h-2.5',
  },
};

export default function StatusBadge({
  status,
  label,
  size = 'md',
  animate = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeConfig_ = sizeConfig[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${sizeConfig_.padding}
        ${config.bgColor}
        border border-opacity-30 ${config.color}
        rounded-full
        transition-all duration-200
      `}
    >
      <div
        className={`
          ${sizeConfig_.dotSize} rounded-full ${config.dotColor}
          ${animate ? 'animate-pulse' : ''}
        `}
      />
      <span className={`${sizeConfig_.textSize} font-semibold ${config.color} font-mono`}>
        {label || config.label}
      </span>
    </div>
  );
}
