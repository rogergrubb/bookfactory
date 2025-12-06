import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { useBooks } from '../useBooks';

vi.mock('swr');

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when loading', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useBooks());
    
    expect(result.current.books).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns books when loaded', () => {
    const mockBooks = [
      { id: '1', title: 'Book 1' },
      { id: '2', title: 'Book 2' },
    ];

    vi.mocked(useSWR).mockReturnValue({
      data: { books: mockBooks, pagination: { total: 2 } },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useBooks());
    
    expect(result.current.books).toEqual(mockBooks);
    expect(result.current.isLoading).toBe(false);
  });
});
