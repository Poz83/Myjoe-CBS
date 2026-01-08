'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{
    id: string;
    src: string;
    alt?: string;
    label?: string;
  }>;
  initialIndex?: number;
  onDownload?: (imageId: string) => void;
}

export function ThumbnailLightbox({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  onDownload,
}: ThumbnailLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setIsLoading(true);
    }
  }, [open, initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
    setIsLoading(true);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setIsLoading(true);
  }, [images.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onOpenChange(false);
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, handlePrevious, handleNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted || !open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const lightboxContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      {/* Top Controls Bar */}
      <div className="fixed top-0 left-0 right-0 z-[101] flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        {/* Left - Image info */}
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.label && (
            <>
              <span className="w-px h-4 bg-white/30" />
              <span className="text-white/60 text-sm">{currentImage.label}</span>
            </>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1">
          <ControlButton
            icon={<ZoomOut className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            tooltip="Zoom out (-)"
            disabled={zoom <= 0.5}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetZoom();
            }}
            className="h-8 px-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ControlButton
            icon={<ZoomIn className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            tooltip="Zoom in (+)"
            disabled={zoom >= 3}
          />
          <div className="w-px h-4 bg-white/20 mx-2" />
          {onDownload && (
            <ControlButton
              icon={<Download className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(currentImage.id);
              }}
              tooltip="Download"
            />
          )}
          <ControlButton
            icon={<Maximize2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setZoom(1);
            }}
            tooltip="Fit to screen (0)"
          />
          <ControlButton
            icon={<X className="w-5 h-5" />}
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            tooltip="Close (Esc)"
            className="ml-2"
          />
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative z-[101] flex items-center justify-center w-full h-full px-16 py-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white transition-all hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/80 hover:text-white transition-all hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image */}
        <div
          className="relative max-w-full max-h-full overflow-auto"
          style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <img
            src={currentImage.src}
            alt={currentImage.alt || `Image ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
            onLoad={() => setIsLoading(false)}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-[101] flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2 p-2 bg-black/40 rounded-xl backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setZoom(1);
                  setIsLoading(true);
                }}
                className={cn(
                  'relative w-16 h-16 rounded-lg overflow-hidden transition-all',
                  'hover:ring-2 hover:ring-white/50',
                  index === currentIndex
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/40'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={image.src}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-black/70 rounded text-[10px] text-white flex items-center justify-center font-medium">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(lightboxContent, document.body);
}

// Helper component for control buttons
function ControlButton({
  icon,
  onClick,
  tooltip,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-md',
        'text-white/80 hover:text-white hover:bg-white/10',
        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      {icon}
    </button>
  );
}

// Thumbnail preview popover for hover states
interface ThumbnailPreviewProps {
  src: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
  onExpand?: () => void;
}

export function ThumbnailPreview({
  src,
  alt,
  className,
  children,
  onExpand,
}: ThumbnailPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Position preview to the right of cursor, or left if near right edge
    const previewWidth = 280;
    const previewHeight = 280;
    const padding = 20;

    let posX = x + padding;
    let posY = y - previewHeight / 2;

    // Adjust if preview would go off-screen
    if (posX + previewWidth > window.innerWidth) {
      posX = x - previewWidth - padding;
    }
    if (posY < padding) {
      posY = padding;
    }
    if (posY + previewHeight > window.innerHeight - padding) {
      posY = window.innerHeight - previewHeight - padding;
    }

    setPosition({ x: posX, y: posY });
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {/* Preview Popover */}
      {isHovered && src && (
        <div
          className="fixed z-[80] pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="w-[280px] h-[280px] bg-zinc-800 relative">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain"
              />
            </div>
            {onExpand && (
              <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/80">
                <p className="text-xs text-zinc-400 text-center">
                  Click to expand
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
