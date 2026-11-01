import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertTriangle, Eye, Plus, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface MultiPhotoUploadProps {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  helperText?: string;
}

export const MultiPhotoUpload: React.FC<MultiPhotoUploadProps> = ({
  label,
  photos = [],
  onChange,
  maxFiles = 50,
  maxSizeMb = 10,
  helperText = 'Upload multiple photos (PNG, JPG, WebP up to 10MB each)',
}) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const files = Array.from(fileList);
    const validFiles: File[] = [];

    // Validate size and type for each
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image file.`);
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`"${file.name}" exceeds the ${maxSizeMb}MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (photos.length + validFiles.length > maxFiles) {
      setError(`Maximum limit of ${maxFiles} photos reached.`);
      return;
    }

    setProgress(15);
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev === null ? 15 : prev >= 90 ? 90 : prev + 25));
    }, 120);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        // 1. Try Supabase Storage if configured
        if (isSupabaseConfigured()) {
          const client = getSupabaseClient();
          if (client) {
            const ext = file.name.split('.').pop();
            const filePath = `photos/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

            const { error: uploadError } = await client.storage
              .from('portfolio-assets')
              .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (!uploadError) {
              const { data: publicData } = client.storage
                .from('portfolio-assets')
                .getPublicUrl(filePath);
              uploadedUrls.push(publicData.publicUrl);
              continue;
            }
          }
        }

        // 2. Base64 fallback (persisted in IndexedDB without quota issues)
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(base64Url);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        onChange([...photos, ...uploadedUrls]);
        setProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(null);
      setError(err?.message || 'Failed to upload photos.');
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#3A0F05] flex items-center gap-1.5">
          <span>{label}</span>
          <span className="bg-[#8F2547] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {photos.length} Photo{photos.length === 1 ? '' : 's'}
          </span>
        </label>
        <span className="text-[11px] text-[#85203F]">{helperText}</span>
      </div>

      {/* Existing Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-3 bg-white/50 rounded-2xl border border-white/70 max-h-60 overflow-y-auto">
          {photos.map((url, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-pink-100/60 border border-white shadow-xs">
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(url)}
                  className="p-1 rounded-full bg-white/90 text-[#3A0F05] hover:bg-white"
                  title="View Photo"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                  title="Remove Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more photo slot */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-[#C9577B]/60 hover:border-[#8F2547] bg-white/40 hover:bg-white/80 aspect-square flex flex-col items-center justify-center text-[#8F2547] transition-all cursor-pointer"
            title="Add more photos"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Add More</span>
          </button>
        </div>
      )}

      {/* Empty State Upload Drop Box */}
      {photos.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-[#C9577B]/50 hover:border-[#8F2547] bg-white/40 hover:bg-white/60 rounded-2xl p-5 text-center transition-all group flex flex-col items-center justify-center gap-1.5"
        >
          <div className="p-2.5 rounded-full bg-white text-[#8F2547] group-hover:scale-110 transition-transform shadow-xs">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#3A0F05]">
            Click to upload multiple photos at once
          </p>
          <p className="text-[11px] text-[#85203F]">
            Select multiple images (PNG, JPG, WebP) from your device
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#8F2547]">
            <span>Uploading multiple photos...</span>
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100/90 px-3 py-1.5 rounded-xl border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFiles}
        className="hidden"
      />

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-2xl max-h-[90vh] bg-white/20 p-2 rounded-2xl border border-white/80 shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-[#8F2547] text-white shadow-md hover:bg-[#7A1F3C]"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewPhoto}
              alt="Full Preview"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
