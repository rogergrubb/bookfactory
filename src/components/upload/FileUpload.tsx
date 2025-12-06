'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  type: 'cover' | 'manuscript' | 'avatar';
  onUpload: (result: { url: string; filename: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const typeConfig = {
  cover: {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    icon: Image,
    label: 'Upload Cover Image',
    hint: 'JPG, PNG, or WebP up to 10MB',
  },
  manuscript: {
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 50 * 1024 * 1024,
    icon: FileText,
    label: 'Upload Manuscript',
    hint: 'DOCX, TXT, or Markdown up to 50MB',
  },
  avatar: {
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    icon: Image,
    label: 'Upload Avatar',
    hint: 'JPG, PNG, or WebP up to 5MB',
  },
};

export function FileUpload({ type, onUpload, onError, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = typeConfig[type];

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadedFile(result);
      onUpload(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) uploadFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.accept,
    maxSize: config.maxSize,
    multiple: false,
    disabled: uploading,
  });

  const Icon = config.icon;

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all',
          isDragActive ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-300 hover:border-slate-400 dark:border-slate-700',
          uploading && 'pointer-events-none opacity-50',
          uploadedFile && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
        )}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-violet-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploading...</p>
              <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div className="h-full bg-violet-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Upload Complete!</p>
              <p className="mt-1 text-xs text-slate-500">{uploadedFile.filename}</p>
              <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="mt-3 text-xs text-slate-500 hover:text-violet-600">Upload different file</button>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="mt-3 text-xs text-slate-500 hover:text-violet-600">Try again</button>
            </motion.div>
          ) : (
            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors', isDragActive ? 'bg-violet-100' : 'bg-slate-100 dark:bg-slate-800')}>
                <Icon className={cn('h-6 w-6 transition-colors', isDragActive ? 'text-violet-600' : 'text-slate-400')} />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{isDragActive ? 'Drop file here' : config.label}</p>
              <p className="mt-1 text-xs text-slate-500">{config.hint}</p>
              <p className="mt-2 text-xs text-slate-400">or click to browse</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {type === 'cover' && uploadedFile && (
        <div className="mt-4">
          <img src={uploadedFile.url} alt="Cover preview" className="mx-auto h-48 rounded-lg object-cover shadow-lg" />
        </div>
      )}
    </div>
  );
}
export default FileUpload;
