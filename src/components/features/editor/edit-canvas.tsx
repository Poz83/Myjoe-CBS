'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Brush, Circle, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditCanvasProps {
  imageUrl: string;
  onMaskCreate: (maskDataUrl: string) => void;
  onCancel: () => void;
}

type Tool = 'brush' | 'circle' | 'rectangle';

interface Point {
  x: number;
  y: number;
}

export function EditCanvas({ imageUrl, onMaskCreate, onCancel }: EditCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [tool, setTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Paint color: semi-transparent pink/red
  const PAINT_COLOR = 'rgba(255, 100, 100, 0.5)';

  // Handle image load and canvas sizing
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 140; // Account for toolbars

        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;

        let width, height;
        if (imgAspect > containerAspect) {
          width = Math.min(containerWidth, img.width);
          height = width / imgAspect;
        } else {
          height = Math.min(containerHeight, img.height);
          width = height * imgAspect;
        }

        setCanvasSize({ width, height });
        setImageLoaded(true);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Get canvas coordinates from event
  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Draw brush stroke
  const drawBrush = useCallback((ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    ctx.strokeStyle = PAINT_COLOR;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, [brushSize]);

  // Draw circle
  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, center: Point, radius: number) => {
    ctx.fillStyle = PAINT_COLOR;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Draw rectangle
  const drawRectangle = useCallback((ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.fillStyle = PAINT_COLOR;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    ctx.fillRect(x, y, width, height);
  }, []);

  // Handle mouse/touch down
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasCoords(e);
    if (!point) return;

    setIsDrawing(true);
    setStartPoint(point);

    if (tool === 'brush') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        // Draw initial dot
        ctx.fillStyle = PAINT_COLOR;
        ctx.beginPath();
        ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [tool, brushSize, getCanvasCoords]);

  // Handle mouse/touch move
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getCanvasCoords(e);
    if (!point || !startPoint) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (tool === 'brush') {
      drawBrush(ctx, startPoint, point);
      setStartPoint(point);
    }
    // For circle and rectangle, we'll draw preview on mouseup
  }, [isDrawing, tool, startPoint, getCanvasCoords, drawBrush]);

  // Handle mouse/touch up
  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const point = getCanvasCoords(e) || startPoint;
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      if (tool === 'circle') {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        drawCircle(ctx, startPoint, radius);
      } else if (tool === 'rectangle') {
        drawRectangle(ctx, startPoint, point);
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
  }, [isDrawing, startPoint, tool, getCanvasCoords, drawCircle, drawRectangle]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasSize.width && canvasSize.height) {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    }
  }, [canvasSize]);

  // Export mask
  const handleDone = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temporary canvas for mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // Fill black background (preserve areas)
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Get image data from original canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create mask: white where painted (alpha > 0)
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const maskData = maskImageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        // Painted area - white (edit area)
        maskData[i] = 255;     // R
        maskData[i + 1] = 255; // G
        maskData[i + 2] = 255; // B
        maskData[i + 3] = 255; // A
      }
      // Black (preserve) is already set by fillRect
    }

    maskCtx.putImageData(maskImageData, 0, 0);

    // Export as PNG data URL
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onMaskCreate(maskDataUrl);
  }, [onMaskCreate]);

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900 border-b border-zinc-800">
        {/* Tool buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={tool === 'brush' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTool('brush')}
            icon={<Brush className="w-4 h-4" />}
          >
            Brush
          </Button>
          <Button
            variant={tool === 'circle' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTool('circle')}
            icon={<Circle className="w-4 h-4" />}
          >
            Circle
          </Button>
          <Button
            variant={tool === 'rectangle' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTool('rectangle')}
            icon={<Square className="w-4 h-4" />}
          >
            Rectangle
          </Button>
        </div>

        {/* Brush size slider */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Size:</label>
          <input
            type="range"
            min="10"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-sm text-zinc-300 w-8">{brushSize}</span>
        </div>

        {/* Clear button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Clear
        </Button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {imageLoaded && canvasSize.width > 0 && (
          <div
            className="relative"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          >
            {/* Background image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Page to edit"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              crossOrigin="anonymous"
            />
            {/* Drawing canvas overlay */}
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className={cn(
                'absolute inset-0 touch-none',
                tool === 'brush' && 'cursor-crosshair'
              )}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>
        )}
        {!imageLoaded && (
          <div className="text-zinc-400">Loading image...</div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-3 p-4 bg-zinc-900 border-t border-zinc-800">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
