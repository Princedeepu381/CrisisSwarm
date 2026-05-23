'use client';

import { ReactNode } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  animate = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  // Motion values to store coordinates for hardware-accelerated spotlight gradient
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      whileHover={hover ? { y: -3 } : {}}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`
        relative group
        bg-cs-dark-700/35 backdrop-blur-2xl
        border border-cs-blue-400/10 hover:border-cs-blue-400/25
        rounded-2xl
        shadow-[0_8px_32px_0_rgba(8,13,23,0.35)]
        hover:shadow-[0_12px_40px_0_rgba(0,120,212,0.08)]
        transition-all duration-300
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Background cyber grid detail */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,120,212,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,120,212,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Dynamic hardware-accelerated spotlight highlight tracking the cursor */}
      {hover && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                280px circle at ${mouseX}px ${mouseY}px,
                rgba(0, 194, 255, 0.08),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Outer borders sheens for depth */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cs-blue-400/20 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-cs-blue-400/10 to-transparent pointer-events-none opacity-20" />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
