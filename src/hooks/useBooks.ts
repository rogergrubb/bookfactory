import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  genre: string;
  status: 'DRAFT' | 'WRITING' | 'EDITING' | 'PUBLISHED';
  wordCount: number;
  targetWordCount: number;
  coverUrl?: string;
  chapters: { id: string; wordCount: number; status: string }[];
  series?: { id: string; name: string };
  updatedAt: string;
  createdAt: string;
}

export function useBooks(options?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.search) params.set('search', options.search);
  
  const { data, error, mutate, isLoading } = useSWR<{ books: Book[]; pagination: any }>(
    `/api/books?${params.toString()}`,
    fetcher
  );

  const createBook = useCallback(async (bookData: Partial<Book>) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    const result = await res.json();
    mutate();
    return result;
  }, [mutate]);

  const updateBook = useCallback(async (bookId: string, bookData: Partial<Book>) => {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    const result = await res.json();
    mutate();
    return result;
  }, [mutate]);

  const deleteBook = useCallback(async (bookId: string) => {
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
    mutate();
  }, [mutate]);

  return {
    books: data?.books || [],
    pagination: data?.pagination,
    isLoading,
    error,
    createBook,
    updateBook,
    deleteBook,
    refresh: mutate,
  };
}

export function useBook(bookId: string) {
  const { data, error, mutate, isLoading } = useSWR<Book>(
    bookId ? `/api/books/${bookId}` : null,
    fetcher
  );

  return {
    book: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
