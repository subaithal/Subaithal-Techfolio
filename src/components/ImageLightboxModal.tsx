import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  images: string[];
  initialIndex?: number;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageError(false);
      setImageLoading(true);
    }
  }, [isOpen, initialIndex, images]);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images]);

  if (!isOpen || images.length === 0) return null;

  const currentUrl = images[currentIndex] || '';
  const isPdf = currentUrl.startsWith('data:application/pdf') || currentUrl.toLowerCase().endsWith('.pdf');

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-[#16060E]/85 border-b border-rose-500/20 text-white z-20">
        <div className="flex flex-col min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm sm:text-base text-rose-50 truncate max-w-xs sm:max-w-md">
              {title || 'Image Preview'}
            </h3>
            {images.length > 1 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-rose-300/80 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isPdf && (
            <>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-rose-200 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-rose-300 px-1 min-w-[45px] text-center hidden sm:inline-block">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-rose-200 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleRotate}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-rose-200 hover:text-white transition-all cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-rose-200 hover:text-white transition-all cursor-pointer hidden sm:inline-flex"
                title="Reset Zoom & Position"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-rose-200 hover:text-white transition-all cursor-pointer hidden md:inline-flex"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </>
          )}

          <a
            href={currentUrl}
            download={`document-${currentIndex + 1}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-100 transition-all cursor-pointer"
            title="Download Full Resolution"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all ml-1 cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {/* Navigation Arrows for multi-images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-rose-900/90 text-white border border-rose-500/30 transition-all shadow-xl hover:scale-105"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-rose-900/90 text-white border border-rose-500/30 transition-all shadow-xl hover:scale-105"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Media Container */}
        {isPdf ? (
          <div className="w-full h-full max-w-4xl bg-white/10 rounded-2xl border border-rose-500/30 overflow-hidden flex flex-col">
            <iframe
              src={currentUrl}
              title={title || 'Document Preview'}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        ) : imageError ? (
          <div className="flex flex-col items-center justify-center p-8 bg-rose-950/80 border border-rose-500/40 rounded-2xl max-w-md text-center space-y-4 shadow-2xl z-10 m-4">
            <div className="p-3 bg-rose-900/50 rounded-full border border-rose-500/30">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-heading font-bold text-base text-rose-100">
                Certificate Image Unavailable
              </h4>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                This image could not be loaded from Supabase cloud storage. Check your network connection or verify that the storage bucket policy is active.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                }}
                className="btn-rose-secondary px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
              >
                Retry Loading
              </button>
              {currentUrl && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rose-gradient px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL Directly</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div 
            className="transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full relative"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              </div>
            )}
            <img
              src={currentUrl}
              alt={title || 'Preview'}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              className={`max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl pointer-events-none transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip (if multiple images) */}
      {images.length > 1 && (
        <div className="px-4 py-2.5 bg-[#16060E]/90 border-t border-rose-500/20 flex items-center justify-center gap-2 overflow-x-auto z-20">
          {images.map((thumbUrl, idx) => {
            const isThumbPdf = thumbUrl.startsWith('data:application/pdf') || thumbUrl.toLowerCase().endsWith('.pdf');
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-rose-400 scale-105 shadow-md shadow-rose-900/50'
                    : 'border-rose-950/80 opacity-60 hover:opacity-100 hover:border-rose-600/60'
                }`}
              >
                {isThumbPdf ? (
                  <div className="w-full h-full bg-rose-950/80 flex items-center justify-center text-rose-300">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
