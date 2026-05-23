import React from 'react';
import { motion } from 'framer-motion';

interface ThreatGaugeProps {
  level: number; // 0 to 10
}

export function ThreatGauge({ level }: ThreatGaugeProps) {
  const normalizedLevel = Math.min(Math.max(level, 0), 10);
  const percentage = (normalizedLevel / 10) * 100;
  
  // Determine color based on level
  let color = 'text-green-500';
  let stroke = '#22c55e'; // green-500
  if (normalizedLevel >= 7) {
    color = 'text-red-500';
    stroke = '#ef4444'; // red-500
  } else if (normalizedLevel >= 4) {
    color = 'text-amber-500';
    stroke = '#f59e0b'; // amber-500
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated value track */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={stroke}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold font-mono tracking-tighter ${color}`}>
          {normalizedLevel.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
