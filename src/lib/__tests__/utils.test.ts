import { describe, it, expect } from 'vitest';
import { cn, formatWordCount, formatDate, formatCurrency, slugify, truncate, calculateReadingTime } from '../utils';

describe('cn (classNames)', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('handles tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('formatWordCount', () => {
  it('formats small numbers', () => {
    expect(formatWordCount(500)).toBe('500');
  });

  it('formats thousands', () => {
    expect(formatWordCount(1500)).toBe('1.5k');
  });

  it('formats large numbers', () => {
    expect(formatWordCount(150000)).toBe('150k');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats EUR', () => {
    expect(formatCurrency(1234.56, 'EUR')).toContain('1,234.56');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('returns original if shorter than max', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long strings', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });
});

describe('calculateReadingTime', () => {
  it('calculates reading time correctly', () => {
    const text = 'word '.repeat(500); // 500 words
    expect(calculateReadingTime(text)).toBe(2); // 500/250 = 2 minutes
  });

  it('returns at least 1 minute', () => {
    expect(calculateReadingTime('short')).toBe(1);
  });
});
