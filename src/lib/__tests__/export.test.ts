import { describe, it, expect } from 'vitest';
import { exportBook } from '../export';

const mockBook = {
  id: 'test-book',
  title: 'Test Book',
  subtitle: 'A Test Subtitle',
  description: 'Test description',
  genre: 'Fiction',
  chapters: [
    { id: 'ch1', title: 'Chapter One', content: '<p>This is chapter one content.</p>', order: 1 },
    { id: 'ch2', title: 'Chapter Two', content: '<p>This is chapter two content.</p>', order: 2 },
  ],
};

describe('exportBook', () => {
  describe('markdown export', () => {
    it('generates valid markdown', async () => {
      const result = await exportBook(mockBook, 'markdown');
      
      expect(result.filename).toBe('test-book.md');
      expect(result.mimeType).toBe('text/markdown');
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('# Test Book');
      expect(result.data).toContain('Chapter One');
    });

    it('includes table of contents', async () => {
      const result = await exportBook(mockBook, 'markdown', { includeToc: true });
      expect(result.data).toContain('Table of Contents');
    });
  });

  describe('html export', () => {
    it('generates valid HTML', async () => {
      const result = await exportBook(mockBook, 'html');
      
      expect(result.filename).toBe('test-book.html');
      expect(result.mimeType).toBe('text/html');
      expect(result.data).toContain('<!DOCTYPE html>');
      expect(result.data).toContain('<title>Test Book</title>');
    });
  });

  describe('epub export', () => {
    it('generates epub buffer', async () => {
      const result = await exportBook(mockBook, 'epub');
      
      expect(result.filename).toBe('test-book.epub');
      expect(result.mimeType).toBe('application/epub+zip');
      expect(Buffer.isBuffer(result.data)).toBe(true);
    });
  });

  describe('pdf export', () => {
    it('generates pdf buffer', async () => {
      const result = await exportBook(mockBook, 'pdf');
      
      expect(result.filename).toBe('test-book.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(Buffer.isBuffer(result.data)).toBe(true);
    });
  });

  describe('docx export', () => {
    it('generates docx buffer', async () => {
      const result = await exportBook(mockBook, 'docx');
      
      expect(result.filename).toBe('test-book.docx');
      expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(Buffer.isBuffer(result.data)).toBe(true);
    });
  });
});
