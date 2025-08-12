'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Wand2 } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

interface ProcessingScreenProps {
  selectedFile: File;
  onProcessingComplete: (originalImage: string, processedImage: Blob) => void;
  onError: (error: string) => void;
}

export default function ProcessingScreen({ 
  selectedFile, 
  onProcessingComplete, 
  onError 
}: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing...');
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    processImage();
  }, [selectedFile]);

  const processImage = async () => {
    try {
      // Check if this is likely the first time (no cached models)
      const hasCache = localStorage.getItem('bgremoval_models_cached');
      setIsFirstTime(!hasCache);

      // Create image URL for preview
      const originalImageUrl = URL.createObjectURL(selectedFile);

      // Simulate progress stages
      const stages = [
        { progress: 10, text: 'Loading AI models...' },
        { progress: 30, text: 'Analyzing image...' },
        { progress: 50, text: 'Detecting objects...' },
        { progress: 70, text: 'Processing background...' },
        { progress: 90, text: 'Finalizing...' },
      ];

      // Update progress through stages
      for (const { progress, text } of stages) {
        setStage(text);
        setProgress(progress);
        // Optimized delays for better UX
        const delay = isFirstTime ? 500 : 100; // 0.5s first time, 0.1s subsequent
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Perform actual background removal
      setStage('Removing background...');
      setProgress(95);
      
      const processedBlob = await removeBackground(selectedFile);
      
      // Mark that models are now cached
      localStorage.setItem('bgremoval_models_cached', 'true');
      
      setProgress(100);
      setStage('Complete!');
      
      // Short delay before proceeding
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProcessingComplete(originalImageUrl, processedBlob);
      
    } catch (error) {
      console.error('Processing error:', error);
      onError(error instanceof Error ? error.message : 'Failed to process image');
    }
  };

  const estimatedTime = isFirstTime ? '~30 seconds' : '~5 seconds';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/assets/logos/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Text Behind Image
          </h1>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="w-full max-w-lg text-center px-8">
          {/* Main Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-4">
                <Wand2 size={32} className="text-white" />
              </div>
              {/* Subtle line below icon */}
              <div className="w-8 h-0.5 bg-gray-300 mx-auto"></div>
            </div>
          </div>

          {/* Processing Status */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Downloading resources: {Math.round(progress)}%
            </h2>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                  Hang tight — It's a one-time load delay due<br />
                  to browser caching. Future loads will be<br />
                  instant.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {isFirstTime ? (
              <p>First time processing takes longer to download AI models</p>
            ) : (
              <p>Estimated time: {estimatedTime}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}