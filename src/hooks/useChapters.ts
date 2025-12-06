import { useCallback } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: 'DRAFT' | 'COMPLETE' | 'REVISION';
  updatedAt: string;
}

export function useChapters(bookId: string) {
  const { data, error, mutate, isLoading } = useSWR<{ chapters: Chapter[] }>(
    bookId ? `/api/chapters?bookId=${bookId}` : null,
    fetcher
  );

  const createChapter = useCallback(async (chapterData: Partial<Chapter>) => {
    const res = await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, ...chapterData }),
    });
    const result = await res.json();
    mutate();
    return result;
  }, [bookId, mutate]);

  const updateChapter = useCallback(async (chapterId: string, chapterData: Partial<Chapter>) => {
    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData),
    });
    const result = await res.json();
    mutate();
    return result;
  }, [mutate]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
    mutate();
  }, [mutate]);

  const reorderChapters = useCallback(async (chapterIds: string[]) => {
    await Promise.all(
      chapterIds.map((id, index) =>
        fetch(`/api/chapters/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: index + 1 }),
        })
      )
    );
    mutate();
  }, [mutate]);

  return {
    chapters: data?.chapters || [],
    isLoading,
    error,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    refresh: mutate,
  };
}
