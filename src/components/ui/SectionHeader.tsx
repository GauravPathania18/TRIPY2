/**
 * Shared section heading: optional eyebrow badge, title, optional subtitle.
 * Replaces the repeated "centered header" markup across page sections.
 */
import React from 'react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ badge, title, subtitle, className = '' }: SectionHeaderProps) {
  return (
    <div className={`text-center mb-10 ${className}`}>
      {badge && (
        <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold px-3 py-1 bg-amber-500/5 rounded-full">
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl md:text-5xl font-display font-medium tracking-tight text-slate-900 dark:text-white ${
          badge ? 'mt-4 mb-3' : 'mb-3'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
