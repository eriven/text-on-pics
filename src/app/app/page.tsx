'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, User } from 'lucide-react';
import ProcessingScreen from '@/components/ProcessingScreen';
import EditorScreen from '@/components/EditorScreen';

type AppState = 'upload' | 'processing' | 'editor';

interface ProcessedImages {
  original: string;
  processed: Blob;
}

export default function AppHome() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImages | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setCurrentState('processing');
      setError(null);
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleProcessingComplete = (originalImage: string, processedImage: Blob) => {
    setProcessedImages({ original: originalImage, processed: processedImage });
    setCurrentState('editor');
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentState('upload');
  };

  if (currentState === 'processing' && selectedFile) {
    return (
      <ProcessingScreen
        selectedFile={selectedFile}
        onProcessingComplete={handleProcessingComplete}
        onError={handleProcessingError}
      />
    );
  }

  if (currentState === 'editor' && processedImages) {
    return (
      <EditorScreen
        originalImage={processedImages.original}
        processedImage={processedImages.processed}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/assets/logos/logo.png" alt="Logo" className="w-full h-full object-cover" />
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
        <div className="hidden lg:flex lg:w-1/3 xl:w-2/5 p-12 items-center">
          <div className="max-w-md">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              Start your creative journey by selecting a photo. Our AI will analyze it and prepare it for stunning text-behind effects.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Upload size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Welcome
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Get started by uploading an image!
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              onClick={handleChoosePhoto}
              className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-medium rounded-2xl w-full max-w-xs"
            >
              Choose a Photo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="lg:hidden mt-12 text-left">
              <h3 className="text-2xl font-bold text-red-500 leading-tight mb-4">
                Upload your image to get started
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Choose any photo and our AI will prepare it for amazing text-behind effects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



