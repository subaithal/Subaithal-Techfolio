import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { TeddyBear } from './TeddyBear';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Are you sure?',
  itemName,
  message = 'This action will permanently delete this item. Added data stays saved until deleted.',
  confirmLabel = 'Yes, Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-card max-w-md w-full p-6 sm:p-7 relative border-2 border-white/70 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Close X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[#85203F] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100/90 text-[#8F2547] rounded-2xl shrink-0 border border-red-200/60 shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TeddyBear variant="heading" size={20} />
              <h3 id="confirm-modal-title" className="font-heading font-bold text-xl text-[#3A0F05]">
                {title}
              </h3>
            </div>

            {itemName && (
              <p className="font-semibold text-sm text-[#8F2547] mb-1 truncate">
                "{itemName}"
              </p>
            )}

            <p className="text-xs text-[#4F2119]/85 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#4F2119] bg-white/70 hover:bg-white border border-white/80 transition-all shadow-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-md transition-all active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
