import React from 'react';

interface StatusBadgeProps {
  label: string;
  tone?: 'sky' | 'emerald' | 'rose' | 'amber';
}

const toneClasses = {
  sky: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  rose: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  amber: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'sky' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
