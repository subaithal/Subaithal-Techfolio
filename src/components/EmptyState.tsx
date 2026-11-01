import React from 'react';
import { TeddyBear } from './TeddyBear';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Coming Soon',
  message = 'Subaithal is curating exciting updates for this section. Please check back shortly!',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`glass-card p-8 sm:p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center my-8 ${className}`}>
      {/* Floating cute teddy bear */}
      <div className="relative mb-4">
        <TeddyBear variant="empty" size={120} animated />
        <span className="absolute -top-1 -right-2 p-1.5 bg-white/90 rounded-full shadow-sm text-[#C9577B] animate-pulse">
          <Sparkles className="w-4 h-4" />
        </span>
      </div>

      {/* Title with small ribbon underline effect */}
      <h3 className="font-heading font-bold text-2xl text-[#3A0F05] tracking-tight mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-[#4F2119]/90 leading-relaxed max-w-sm mb-6">
        {message}
      </p>

      {/* Optional Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-rose-gradient px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
