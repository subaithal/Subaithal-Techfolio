import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface FileUploadProps {
  label: string;
  accept?: string;
  value?: string;
  onChange: (url: string) => void;
  allowedTypes?: ('image' | 'pdf')[];
  maxSizeMb?: number;
  helperText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/png,image/jpeg,image/webp,application/pdf',
  value,
  onChange,
  allowedTypes = ['image', 'pdf'],
  maxSizeMb = 10,
  helperText = 'PNG, JPG, WebP, or PDF (max 10MB)',
}) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (max 10MB)
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMb} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (allowedTypes.includes('image') && !allowedTypes.includes('pdf') && !isImage) {
      setError('Only image files (PNG, JPG, WebP) are accepted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (allowedTypes.includes('pdf') && !allowedTypes.includes('image') && !isPdf) {
      setError('Only PDF documents are accepted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!isImage && !isPdf) {
      setError('Invalid format. Please select a PNG, JPG, WebP, or PDF file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Progress bar simulation & upload handler
    setProgress(15);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev === null) return 15;
        if (prev >= 90) return 90;
        return prev + 25;
      });
    }, 120);

    try {
      // If Supabase Storage is configured, upload to 'portfolio-assets' bucket
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await client.storage
            .from('portfolio-assets')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicData } = client.storage
              .from('portfolio-assets')
              .getPublicUrl(filePath);

            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
              onChange(publicData.publicUrl);
              setProgress(null);
            }, 300);
            return;
          }
        }
      }

      // Local / Offline Base64 Fallback:
      const reader = new FileReader();
      reader.onload = () => {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          onChange(reader.result as string);
          setProgress(null);
        }, 300);
      };
      reader.onerror = () => {
        clearInterval(progressInterval);
        setProgress(null);
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(null);
      setError(err?.message || 'Upload failed.');
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isCurrentPdf = value?.startsWith('data:application/pdf') || value?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#3A0F05] tracking-wide">
          {label}
        </label>
        <span className="text-[11px] text-[#85203F]">{helperText}</span>
      </div>

      {/* Existing Value Preview */}
      {value ? (
        <div className="p-3 bg-white/70 border border-white/90 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            {isCurrentPdf ? (
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-pink-100/80 overflow-hidden shrink-0 border border-white flex items-center justify-center">
                <img
                  src={value}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <ImageIcon className="w-5 h-5 text-[#8F2547]" />
              </div>
            )}
            <div className="truncate">
              <span className="text-xs font-semibold text-[#3A0F05] block truncate">
                {isCurrentPdf ? 'Uploaded PDF Document' : 'Uploaded Image'}
              </span>
              <span className="text-[10px] text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached & ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#8F2547] hover:underline font-medium px-2 py-1"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#85203F]"
              aria-label="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Trigger Box */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-[#C9577B]/50 hover:border-[#8F2547] bg-white/40 hover:bg-white/60 rounded-2xl p-4 text-center transition-all group flex flex-col items-center justify-center gap-1.5"
        >
          <div className="p-2 rounded-full bg-white text-[#8F2547] group-hover:scale-110 transition-transform shadow-xs">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-[#3A0F05]">
            Click to upload file
          </p>
          <p className="text-[11px] text-[#85203F]">
            PDF, PNG, JPG or WebP (max {maxSizeMb}MB)
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== null && (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#8F2547]">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8F2547] to-[#D4688A] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100/90 px-3 py-1.5 rounded-xl border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};
