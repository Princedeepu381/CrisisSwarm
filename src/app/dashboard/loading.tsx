'use client';

import MainLayout from '@/components/layout/MainLayout';

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-glass bg-gradient-to-r from-cs-dark-700/60 via-cs-dark-600/40 to-cs-dark-700/60 bg-[length:200%_100%] ${className || ''}`} />
  );
}

export default function DashboardLoading() {
  return (
    <MainLayout>
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 border-b border-cs-blue-400/10 bg-gradient-to-b from-cs-dark-600/80 via-cs-dark-700/80 to-transparent backdrop-blur-xl">
        <div className="px-6 md:px-8 py-6">
          <Shimmer className="h-9 w-64 mb-3" />
          <Shimmer className="h-4 w-48" />
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* AI Banner skeleton */}
        <Shimmer className="h-16 w-full" />

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Shimmer key={i} className="h-28" />
          ))}
        </div>

        {/* System Health + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Shimmer className="h-64 lg:col-span-2" />
          <Shimmer className="h-64" />
        </div>

        {/* Chart */}
        <Shimmer className="h-72 w-full" />

        {/* Incidents + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Shimmer className="h-80 lg:col-span-2" />
          <Shimmer className="h-80" />
        </div>
      </div>
    </MainLayout>
  );
}
