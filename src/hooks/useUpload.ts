import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  filename: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
  content?: {
    title?: string;
    chapters: { title: string; content: string }[];
    wordCount: number;
  };
}

interface UploadOptions {
  type: 'cover' | 'manuscript';
  bookId?: string;
  extract?: boolean;
  onProgress?: (progress: number) => void;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', options.type);
      if (options.bookId) formData.append('bookId', options.bookId);
      if (options.extract) formData.append('extract', 'true');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          options.onProgress?.(newProgress);
          return newProgress;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);
      options.onProgress?.(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, []);

  const uploadCover = useCallback(async (file: File, bookId?: string) => {
    return upload(file, { type: 'cover', bookId });
  }, [upload]);

  const uploadManuscript = useCallback(async (file: File, bookId?: string, extract = true) => {
    return upload(file, { type: 'manuscript', bookId, extract });
  }, [upload]);

  return {
    upload,
    uploadCover,
    uploadManuscript,
    isUploading,
    progress,
    error,
  };
}

export default useUpload;
