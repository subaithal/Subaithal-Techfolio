import React from 'react';
import { Sparkles, Compass } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Coming Soon',
  message = 'Subaithal is currently preparing updates for this section. Please check back shortly!',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`glass-card p-8 sm:p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center my-8 ${className}`}>
      {/* Refined subtle emblem with ambient glow */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8E183D] to-[#D4436E] flex items-center justify-center text-white shadow-lg shadow-rose-950/60 border border-rose-400/30">
          <Compass className="w-8 h-8 text-rose-100" />
        </div>
        <span className="absolute -top-1 -right-1 p-1.5 bg-rose-950/90 rounded-full shadow-sm text-rose-300 border border-rose-500/30">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        </span>
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-2xl text-rose-50 tracking-tight mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-rose-200/80 leading-relaxed max-w-sm mb-6">
        {message}
      </p>

      {/* Optional Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-rose-gradient px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
