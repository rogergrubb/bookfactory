import { useState, useCallback } from 'react';

export type ExportFormat = 'epub' | 'pdf' | 'docx' | 'markdown' | 'html';

interface ExportOptions {
  bookId: string;
  format: ExportFormat;
  includeTitle?: boolean;
  includeToc?: boolean;
  fontSize?: number;
  fontFamily?: string;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const exportBook = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    setError(null);
    setProgress(10);
    
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      
      setProgress(50);
      
      if (!res.ok) throw new Error('Export failed');
      
      const data = await res.json();
      setProgress(80);
      
      // Create download
      let blob: Blob;
      if (data.encoding === 'base64') {
        const binaryString = atob(data.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: data.mimeType });
      } else {
        blob = new Blob([data.data], { type: data.mimeType });
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  return {
    exportBook,
    isExporting,
    error,
    progress,
  };
}
