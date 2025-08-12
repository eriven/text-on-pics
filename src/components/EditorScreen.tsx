'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Type, 
  Download, 
  User, 
  Edit3,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import TextEditingToolbar from './TextEditingToolbar';
import Image from 'next/image';

interface EditorScreenProps {
  originalImage: string;
  processedImage: Blob;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  opacity: number;
  letterSpacing: number;
  strokeWidth: number;
  strokeColor: string;
  isDragging?: boolean;
}

interface BackgroundImage {
  id: string;
  file: File;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  isSelected?: boolean;
}

export default function EditorScreen({ originalImage, processedImage }: EditorScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Hidden img elements (kept for backward compatibility, but not used for drawing)
  const processedImageRef = useRef<HTMLImageElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);
  // Use preloaded image elements for drawing to avoid race conditions
  const drawOriginalRef = useRef<HTMLImageElement | null>(null);
  const drawProcessedRef = useRef<HTMLImageElement | null>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Add background image state management
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>([]);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null);
  const [backgroundImageCache, setBackgroundImageCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);
  
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    draggedTextId: string | null;
    draggedBackgroundId: string | null;
  }>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    draggedTextId: null,
    draggedBackgroundId: null
  });

  // Initialize canvas and images
  useEffect(() => {
    const loadImages = async () => {
      const processedImageUrl = URL.createObjectURL(processedImage);
      
      // Preload both images and keep references for guaranteed draw readiness
      const [originalImg, processedImg] = await Promise.all([
        loadImage(originalImage),
        loadImage(processedImageUrl)
      ]);

      // Store draw-ready images in refs
      drawOriginalRef.current = originalImg;
      drawProcessedRef.current = processedImg;

      // Also set hidden <img> sources (not used for drawing)
      if (originalImageRef.current && processedImageRef.current) {
        originalImageRef.current.src = originalImage;
        processedImageRef.current.src = processedImageUrl;
      }

      // Set canvas size based on image dimensions
      const maxWidth = 800;
      const maxHeight = 600;
      const aspectRatio = originalImg.width / originalImg.height;
      
      let width = originalImg.width;
      let height = originalImg.height;
      
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      setCanvasSize({ width: Math.round(width), height: Math.round(height) });
      setIsLoading(false);
    };

    loadImages();
  }, [originalImage, processedImage]);

  // Helper function to load images
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const originalImg = drawOriginalRef.current;
    const processedImg = drawProcessedRef.current;
    
    if (!canvas || !originalImg || !processedImg) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw original image (background)
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    
    // Draw background images (behind everything)
    backgroundImages.forEach(backgroundImage => {
      renderBackgroundImage(ctx, backgroundImage);
    });
    
    // Draw text elements that should appear behind objects
    textElements.forEach(textElement => {
      renderTextElement(ctx, textElement);
    });
    
    // Draw processed image (foreground with transparency) on top
    ctx.drawImage(processedImg, 0, 0, canvas.width, canvas.height);
  }, [textElements, backgroundImages, renderBackgroundImage, renderTextElement]);

  // Helper function to render multiline text
  const renderMultilineText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    lineHeight: number,
    strokeWidth: number = 0
  ) => {
    const lines = text.split('\n');
    let currentY = y;
    
    lines.forEach((line) => {
      if (strokeWidth > 0) {
        ctx.strokeText(line, x, currentY);
      }
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    });
    
    return { lines, totalHeight: lines.length * lineHeight };
  };

  // Render individual text element
  const renderTextElement = useCallback((ctx: CanvasRenderingContext2D, textElement: TextElement) => {
    ctx.save();
    
    // Set text properties
    ctx.font = `${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
    ctx.fillStyle = textElement.color;
    ctx.globalAlpha = textElement.opacity;
    ctx.letterSpacing = `${textElement.letterSpacing}px`;
    
    // Calculate line height (font size + some padding)
    const lineHeight = textElement.fontSize * 1.2;
    
    // Add stroke if specified
    if (textElement.strokeWidth > 0) {
      ctx.strokeStyle = textElement.strokeColor;
      ctx.lineWidth = textElement.strokeWidth;
      renderMultilineText(
        ctx,
        textElement.text,
        textElement.x,
        textElement.y,
        lineHeight,
        textElement.strokeWidth
      );
    }
    
    // Draw text
    renderMultilineText(ctx, textElement.text, textElement.x, textElement.y, lineHeight);
    
    // Draw selection indicator
    if (textElement.id === selectedTextId) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const lines = textElement.text.split('\n');
      const lineHeight = textElement.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      
      // Find the widest line for selection box width
      let maxWidth = 0;
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, textMetrics.width);
      });
      
      ctx.strokeRect(
        textElement.x - 5, 
        textElement.y - textElement.fontSize - 5, 
        maxWidth + 10, 
        totalHeight + 10
      );
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }, [selectedTextId]);

  // Export-specific text element renderer (no selection indicators, optimized quality)
  const renderTextElementForExport = (ctx: CanvasRenderingContext2D, textElement: TextElement) => {
    ctx.save();
    
    // Set text properties
    ctx.font = `${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
    ctx.fillStyle = textElement.color;
    ctx.globalAlpha = textElement.opacity;
    ctx.letterSpacing = `${textElement.letterSpacing}px`;
    
    // Calculate line height (font size + some padding)
    const lineHeight = textElement.fontSize * 1.2;
    
    // Add stroke if specified
    if (textElement.strokeWidth > 0) {
      ctx.strokeStyle = textElement.strokeColor;
      ctx.lineWidth = textElement.strokeWidth;
      renderMultilineText(
        ctx,
        textElement.text,
        textElement.x,
        textElement.y,
        lineHeight,
        textElement.strokeWidth
      );
    }
    
    // Draw text
    renderMultilineText(ctx, textElement.text, textElement.x, textElement.y, lineHeight);
    
    ctx.restore();
  };

  // Render individual background image
  const renderBackgroundImage = useCallback((ctx: CanvasRenderingContext2D, backgroundImage: BackgroundImage) => {
    ctx.save();
    
    // Get the cached image
    const img = backgroundImageCache.get(backgroundImage.id);
    
    // Only draw if the image is loaded
    if (img && img.complete) {
      // Set opacity
      ctx.globalAlpha = backgroundImage.opacity;
      
      // Move to center of rotation
      ctx.translate(backgroundImage.x + backgroundImage.width / 2, backgroundImage.y + backgroundImage.height / 2);
      
      // Apply rotation
      ctx.rotate(backgroundImage.rotation * Math.PI / 180);
      
      // Draw the image
      ctx.drawImage(
        img, 
        -backgroundImage.width / 2, 
        -backgroundImage.height / 2, 
        backgroundImage.width, 
        backgroundImage.height
      );
      
      // Draw selection indicator
      if (backgroundImage.id === selectedBackgroundId) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          -backgroundImage.width / 2 - 5, 
          -backgroundImage.height / 2 - 5, 
          backgroundImage.width + 10, 
          backgroundImage.height + 10
        );
        ctx.setLineDash([]);
      }
    }
    
    ctx.restore();
  }, [backgroundImageCache, selectedBackgroundId]);

  // Export-specific background image renderer (no selection indicators, optimized quality)
  const renderBackgroundImageForExport = (ctx: CanvasRenderingContext2D, backgroundImage: BackgroundImage) => {
    ctx.save();
    
    // Get the cached image
    const img = backgroundImageCache.get(backgroundImage.id);
    
    // Only draw if the image is loaded
    if (img && img.complete) {
      // Set opacity
      ctx.globalAlpha = backgroundImage.opacity;
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Move to center of rotation
      ctx.translate(backgroundImage.x + backgroundImage.width / 2, backgroundImage.y + backgroundImage.height / 2);
      
      // Apply rotation
      ctx.rotate(backgroundImage.rotation * Math.PI / 180);
      
      // Draw the image
      ctx.drawImage(
        img, 
        -backgroundImage.width / 2, 
        -backgroundImage.height / 2, 
        backgroundImage.width, 
        backgroundImage.height
      );
    }
    
    ctx.restore();
  };

  // Re-render canvas when dependencies change
  useEffect(() => {
    if (!isLoading) {
      renderCanvas();
    }
  }, [renderCanvas, isLoading]);

  // Keyboard event handler for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Delete key when text is selected and text editor is not open
      if (e.key === 'Delete' && selectedTextId && !showTextEditor) {
        e.preventDefault();
        deleteTextElement(selectedTextId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId, showTextEditor]);

  // Add new text element
  const addTextElement = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: 'pov',
      x: canvasSize.width / 2,
      y: 60, // Position at top middle with some padding from the top
      fontSize: 48,
      fontFamily: 'Arial, sans-serif',
      fontWeight: '400',
      color: '#ffffff',
      opacity: 1,
      letterSpacing: 0,
      strokeWidth: 0,
      strokeColor: '#000000'
    };
    
    setTextElements(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setShowTextEditor(true);
  };

  // Update text element
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(textElement => 
      textElement.id === id ? { ...textElement, ...updates } : textElement
    ));
  };

  // Delete text element
  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(textElement => textElement.id !== id));
    setSelectedTextId(null);
    setShowTextEditor(false);
  };

  // Open text editor for selected text
  const openTextEditor = () => {
    if (selectedTextId) {
      setShowTextEditor(true);
    }
  };

  // Close text editor
  const closeTextEditor = () => {
    setShowTextEditor(false);
  };

  // Background image functions
  const handleBackgroundImageUpload = () => {
    backgroundImageInputRef.current?.click();
  };

  const updateBackgroundImage = (id: string, updates: Partial<BackgroundImage>) => {
    setBackgroundImages(prev => prev.map(backgroundImage => 
      backgroundImage.id === id ? { ...backgroundImage, ...updates } : backgroundImage
    ));
  };

  const deleteBackgroundImage = (id: string) => {
    setBackgroundImages(prev => prev.filter(backgroundImage => backgroundImage.id !== id));
    setSelectedBackgroundId(null);
    setShowBackgroundControls(false);
  };

  const openBackgroundControls = () => {
    if (selectedBackgroundId) {
      setShowBackgroundControls(true);
    }
  };

  const closeBackgroundControls = () => {
    setShowBackgroundControls(false);
  };

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB');
      return;
    }

    // Create background image object
    const backgroundImage: BackgroundImage = {
      id: Date.now().toString(),
      file: file,
      url: URL.createObjectURL(file),
      x: 0,
      y: 0,
      width: 200, // Default width
      height: 200, // Default height
      opacity: 1,
      rotation: 0,
      isSelected: false
    };

    // Preload the image
    const img = new Image();
    img.onload = () => {
      // Add the loaded image to cache
      setBackgroundImageCache(prev => new Map(prev).set(backgroundImage.id, img));
    };
    img.src = backgroundImage.url;

    // Add to background images array
    setBackgroundImages(prev => [...prev, backgroundImage]);
    
    // Select the new background image
    setSelectedBackgroundId(backgroundImage.id);
    
    // Clear the file input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Export/Download functionality
  const exportImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Create a high-resolution export canvas for better quality
      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      
      if (!exportCtx) {
        throw new Error('Failed to get export canvas context');
      }

      // Set export canvas to high resolution (2x for better quality)
      const scale = 2;
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      
      // Scale the context to match the high resolution
      exportCtx.scale(scale, scale);
      
      // Enable high-quality rendering for export
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = 'high';
      
      // Ensure all background images are loaded before export
      const backgroundImagePromises = backgroundImages.map(async (bgImage) => {
        const img = backgroundImageCache.get(bgImage.id);
        if (img && !img.complete) {
          return new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 5000); // 5 second timeout
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              resolve(); // Continue even if some images fail
            };
          });
        }
        return Promise.resolve();
      });
      
      // Wait for all background images to load with timeout
      await Promise.race([
        Promise.all(backgroundImagePromises),
        new Promise(resolve => setTimeout(resolve, 10000)) // 10 second overall timeout
      ]);
      
      setExportProgress(30);
      
      // Force a final render to ensure everything is up to date and draw-ready
      renderCanvas();
      // Guarantee our draw refs are set
      if (!drawOriginalRef.current || !drawProcessedRef.current) {
        // As a fallback, set them from hidden <img> elements if available
        if (originalImageRef.current) drawOriginalRef.current = originalImageRef.current;
        if (processedImageRef.current) drawProcessedRef.current = processedImageRef.current;
      }
      // Small delay to ensure render is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setExportProgress(50);
      
      // Render the export canvas with the same layering as the main canvas
      // Prefer fully preloaded image refs to avoid drawing empty images
      const originalImg = drawOriginalRef.current ?? originalImageRef.current ?? null;
      const processedImg = drawProcessedRef.current ?? processedImageRef.current ?? null;
      
      if (!originalImg || !processedImg) {
        throw new Error('Images not loaded');
      }

      // Ensure images report non-zero dimensions before drawing (in case of late onload)
      if ((originalImg as HTMLImageElement).naturalWidth === 0 || (processedImg as HTMLImageElement).naturalWidth === 0) {
        // Give a short grace period
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Clear export canvas
      exportCtx.clearRect(0, 0, exportCanvas.width / scale, exportCanvas.height / scale);
      
      // Draw original image (background)
      exportCtx.drawImage(originalImg as CanvasImageSource, 0, 0, exportCanvas.width / scale, exportCanvas.height / scale);
      
      // Draw background images (behind everything) with high quality
      backgroundImages.forEach(backgroundImage => {
        try {
          renderBackgroundImageForExport(exportCtx, backgroundImage);
        } catch (error) {
          console.warn(`Failed to render background image ${backgroundImage.id}:`, error);
          // Continue with other background images
        }
      });
      
      // Draw text elements that should appear behind objects
      textElements.forEach(textElement => {
        try {
          renderTextElementForExport(exportCtx, textElement);
        } catch (error) {
          console.warn(`Failed to render text element ${textElement.id}:`, error);
          // Continue with other text elements
        }
      });
      
      // Draw processed image (foreground with transparency) on top
      exportCtx.drawImage(processedImg as CanvasImageSource, 0, 0, exportCanvas.width / scale, exportCanvas.height / scale);
      
      setExportProgress(80);
      
      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.download = `text-behind-image-${timestamp}.png`;
      
      // Convert export canvas to blob with maximum quality
      exportCanvas.toBlob((blob) => {
        if (blob) {
          setExportProgress(90);
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          
          // Cleanup
          setTimeout(() => {
            URL.revokeObjectURL(url);
            setIsExporting(false);
            setExportProgress(0);
            // Clean up the export canvas to free memory
            exportCanvas.width = 0;
            exportCanvas.height = 0;
          }, 500);
        } else {
          setIsExporting(false);
          setExportProgress(0);
          alert('Failed to export image. Please try again.');
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
      alert('Failed to export image. Please try again.');
    }
  };

  // Helper function to get mouse position relative to canvas
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Check if mouse is over a text element
  const getTextElementAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Check from top to bottom (reverse order for proper layering)
    for (let i = textElements.length - 1; i >= 0; i--) {
      const textElement = textElements[i];
      ctx.font = `${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;
      
      const lines = textElement.text.split('\n');
      const lineHeight = textElement.fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      
      // Find the widest line for hit detection
      let maxWidth = 0;
      lines.forEach(line => {
        const textMetrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, textMetrics.width);
      });
      
      if (x >= textElement.x && 
          x <= textElement.x + maxWidth &&
          y >= textElement.y - textElement.fontSize && 
          y <= textElement.y + totalHeight - textElement.fontSize) {
        return textElement;
      }
    }
    return null;
  };

  // Check if mouse is over a background image
  const getBackgroundImageAtPosition = (x: number, y: number) => {
    // Check from top to bottom (reverse order for proper layering)
    for (let i = backgroundImages.length - 1; i >= 0; i--) {
      const backgroundImage = backgroundImages[i];
      
      // Calculate the rotated bounding box
      const centerX = backgroundImage.x + backgroundImage.width / 2;
      const centerY = backgroundImage.y + backgroundImage.height / 2;
      
      // Transform the mouse position to the rotated coordinate system
      const cos = Math.cos(-backgroundImage.rotation * Math.PI / 180);
      const sin = Math.sin(-backgroundImage.rotation * Math.PI / 180);
      
      const dx = x - centerX;
      const dy = y - centerY;
      
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;
      
      // Check if the rotated point is within the image bounds
      if (rotatedX >= -backgroundImage.width / 2 && 
          rotatedX <= backgroundImage.width / 2 &&
          rotatedY >= -backgroundImage.height / 2 && 
          rotatedY <= backgroundImage.height / 2) {
        return backgroundImage;
      }
    }
    return null;
  };

  // Handle canvas mouse events for text and background image dragging
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getCanvasMousePos(e);
    const clickedText = getTextElementAtPosition(mousePos.x, mousePos.y);
    const clickedBackground = getBackgroundImageAtPosition(mousePos.x, mousePos.y);

    if (clickedText) {
      // Clear background selection
      setSelectedBackgroundId(null);
      setSelectedTextId(clickedText.id);
      setDragState({
        isDragging: true,
        dragOffset: {
          x: mousePos.x - clickedText.x,
          y: mousePos.y - clickedText.y
        },
        draggedTextId: clickedText.id,
        draggedBackgroundId: null
      });
    } else if (clickedBackground) {
      // Clear text selection and close text editor
      setSelectedTextId(null);
      setShowTextEditor(false);
      setSelectedBackgroundId(clickedBackground.id);
      setDragState({
        isDragging: true,
        dragOffset: {
          x: mousePos.x - clickedBackground.x,
          y: mousePos.y - clickedBackground.y
        },
        draggedTextId: null,
        draggedBackgroundId: clickedBackground.id
      });
    } else {
      // Clicked empty space - clear all selections and close text editor
      setSelectedTextId(null);
      setSelectedBackgroundId(null);
      setShowTextEditor(false);
      setDragState({
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        draggedTextId: null,
        draggedBackgroundId: null
      });
    }
  };

  // Handle mouse move for dragging
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mousePos = getCanvasMousePos(e);

    if (dragState.isDragging && dragState.draggedTextId) {
      // Update the position of the dragged text
      setTextElements(prev => prev.map(textElement => {
        if (textElement.id === dragState.draggedTextId) {
          return {
            ...textElement,
            x: mousePos.x - dragState.dragOffset.x,
            y: mousePos.y - dragState.dragOffset.y
          };
        }
        return textElement;
      }));
    } else if (dragState.isDragging && dragState.draggedBackgroundId) {
      // Update the position of the dragged background image
      setBackgroundImages(prev => prev.map(backgroundImage => {
        if (backgroundImage.id === dragState.draggedBackgroundId) {
          return {
            ...backgroundImage,
            x: mousePos.x - dragState.dragOffset.x,
            y: mousePos.y - dragState.dragOffset.y
          };
        }
        return backgroundImage;
      }));
    } else {
      // Update cursor based on hover
      const textAtPosition = getTextElementAtPosition(mousePos.x, mousePos.y);
      const backgroundAtPosition = getBackgroundImageAtPosition(mousePos.x, mousePos.y);
      canvas.style.cursor = (textAtPosition || backgroundAtPosition) ? 'grab' : 'crosshair';
    }
  };

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      draggedTextId: null,
      draggedBackgroundId: null
    });
  };

  // Handle mouse leave to stop dragging if mouse leaves canvas
  const handleCanvasMouseLeave = () => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      draggedTextId: null,
      draggedBackgroundId: null
    });
  };

  const selectedText = textElements.find(t => t.id === selectedTextId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <Image src="/assets/logos/logo.png" alt="Logo" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Text Behind Image
          </h1>
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <User size={16} className="text-gray-600 dark:text-gray-300" />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Explanatory Text */}
        <div className="hidden lg:flex lg:w-1/4 p-8 items-start pt-12">
          <div className="max-w-sm">
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
              className="block select-none"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                cursor: dragState.isDragging ? 'grabbing' : 'crosshair'
              }}
            />
          </div>

          {/* Mobile - Explanatory Text */}
          <div className="lg:hidden mt-8 text-center max-w-md">
            <h3 className="text-2xl font-bold text-red-500 leading-tight mb-4">
              Image ready for editing!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Click the text button below to add text behind objects in your image.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 p-4 max-w-4xl mx-auto">
          {/* Text Button */}
          <Button
            onClick={addTextElement}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 bg-white dark:bg-gray-800"
          >
            <Type size={20} />
            <span className="hidden sm:inline">Text</span>
          </Button>

          {/* Background Image Upload Button */}
          <Button
            onClick={handleBackgroundImageUpload}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 bg-white dark:bg-gray-800"
            title="Upload Background Image"
          >
            <Upload size={20} />
            <span className="hidden sm:inline">Background</span>
          </Button>

          {selectedText && (
            <>
              {/* Edit Text Button */}
              <Button
                onClick={openTextEditor}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 bg-white dark:bg-gray-800"
              >
                <Edit3 size={20} />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              {/* Delete Text Button */}
              <Button
                onClick={() => {
                  if (selectedTextId) {
                    deleteTextElement(selectedTextId);
                  }
                }}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={20} />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}

          {selectedBackgroundId && (
            <>
              {/* Edit Background Image Button */}
              <Button
                onClick={openBackgroundControls}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 bg-white dark:bg-gray-800"
                title="Edit Background Image"
              >
                <Edit3 size={20} />
                <span className="hidden sm:inline">Edit</span>
              </Button>

              {/* Delete Background Image Button */}
              <Button
                onClick={() => {
                  if (selectedBackgroundId) {
                    deleteBackgroundImage(selectedBackgroundId);
                  }
                }}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="Delete Background Image"
              >
                <Trash2 size={20} />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}

          <div className="flex-1"></div>

          {/* Download */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={exportImage}
              disabled={isExporting}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              ) : (
                <Download size={20} />
              )}
              <span className="hidden sm:inline">
                {isExporting ? 'Exporting...' : 'Export'}
              </span>
            </Button>
            {isExporting && (
              <div className="w-full">
                <Progress value={exportProgress} className="h-1" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {exportProgress}% Complete
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Editing Toolbar */}
      {showTextEditor && selectedText && (
        <TextEditingToolbar
          selectedText={selectedText}
          onUpdateText={updateTextElement}
          onDeleteText={deleteTextElement}
          onClose={closeTextEditor}
        />
      )}

      {/* Background Image Controls */}
      {showBackgroundControls && selectedBackgroundId && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-4xl w-full mx-4 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Edit3 size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Background Image Editor
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (selectedBackgroundId) {
                    deleteBackgroundImage(selectedBackgroundId);
                  }
                }}
                className="h-8 px-3"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeBackgroundControls}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Size Controls */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Size</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Width: {backgroundImages.find(bg => bg.id === selectedBackgroundId)?.width || 0}px
                  </label>
                  <Slider
                    value={[backgroundImages.find(bg => bg.id === selectedBackgroundId)?.width || 200]}
                    onValueChange={([value]) => {
                      if (selectedBackgroundId) {
                        updateBackgroundImage(selectedBackgroundId, { width: value });
                      }
                    }}
                    min={50}
                    max={800}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height: {backgroundImages.find(bg => bg.id === selectedBackgroundId)?.height || 0}px
                  </label>
                  <Slider
                    value={[backgroundImages.find(bg => bg.id === selectedBackgroundId)?.height || 200]}
                    onValueChange={([value]) => {
                      if (selectedBackgroundId) {
                        updateBackgroundImage(selectedBackgroundId, { height: value });
                      }
                    }}
                    min={50}
                    max={800}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Rotation</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Angle: {backgroundImages.find(bg => bg.id === selectedBackgroundId)?.rotation || 0}°
                </label>
                <Slider
                  value={[backgroundImages.find(bg => bg.id === selectedBackgroundId)?.rotation || 0]}
                  onValueChange={([value]) => {
                    if (selectedBackgroundId) {
                      updateBackgroundImage(selectedBackgroundId, { rotation: value });
                    }
                  }}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Opacity Control */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Opacity</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opacity: {Math.round((backgroundImages.find(bg => bg.id === selectedBackgroundId)?.opacity || 1) * 100)}%
                </label>
                <Slider
                  value={[backgroundImages.find(bg => bg.id === selectedBackgroundId)?.opacity || 1]}
                  onValueChange={([value]) => {
                    if (selectedBackgroundId) {
                      updateBackgroundImage(selectedBackgroundId, { opacity: value });
                    }
                  }}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for background image upload */}
      <input
        ref={backgroundImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundImageSelect}
        className="hidden"
      />

      {/* Hidden image elements for canvas rendering */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={originalImageRef} className="hidden" alt="Original" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={processedImageRef} className="hidden" alt="Processed" />
    </div>
  );
}