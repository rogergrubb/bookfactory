import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
];

interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  metadata?: { width?: number; height?: number; format?: string; size?: number };
}

interface ExtractedContent {
  title?: string;
  chapters: { title: string; content: string }[];
  wordCount: number;
}

async function ensureUploadDir(subdir?: string): Promise<string> {
  const dir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${ext}`;
}

export async function uploadImage(
  file: Buffer,
  originalName: string,
  mimeType: string,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<UploadResult> {
  try {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return { success: false, error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' };
    }
    if (file.length > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large. Maximum size: 10MB' };
    }

    const dir = await ensureUploadDir('covers');
    const filename = generateFilename(originalName);
    const filepath = path.join(dir, filename);

    // Try to use sharp for image processing, fallback to raw save
    try {
      const sharp = require('sharp');
      let processor = sharp(file);
      const metadata = await processor.metadata();
      const maxWidth = options?.maxWidth || 1600;
      const maxHeight = options?.maxHeight || 2560;
      
      if ((metadata.width && metadata.width > maxWidth) || (metadata.height && metadata.height > maxHeight)) {
        processor = processor.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
      }
      
      const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
      const webpFilepath = path.join(dir, webpFilename);
      await processor.webp({ quality: options?.quality || 85 }).toFile(webpFilepath);
      
      const finalMetadata = await sharp(webpFilepath).metadata();
      return {
        success: true,
        url: `/uploads/covers/${webpFilename}`,
        filename: webpFilename,
        metadata: { width: finalMetadata.width, height: finalMetadata.height, format: finalMetadata.format, size: file.length },
      };
    } catch {
      // Sharp not available, save raw file
      await writeFile(filepath, file);
      return { success: true, url: `/uploads/covers/${filename}`, filename, metadata: { size: file.length } };
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error: 'Failed to process image' };
  }
}

export async function uploadManuscript(file: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
  try {
    if (!ALLOWED_DOC_TYPES.includes(mimeType) && !originalName.endsWith('.txt') && !originalName.endsWith('.md')) {
      return { success: false, error: 'Invalid file type. Allowed: DOCX, DOC, TXT, MD' };
    }
    if (file.length > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large. Maximum size: 10MB' };
    }

    const dir = await ensureUploadDir('manuscripts');
    const filename = generateFilename(originalName);
    const filepath = path.join(dir, filename);
    await writeFile(filepath, file);

    return { success: true, url: `/uploads/manuscripts/${filename}`, filename, metadata: { size: file.length } };
  } catch (error) {
    console.error('Manuscript upload error:', error);
    return { success: false, error: 'Failed to upload manuscript' };
  }
}

export async function extractManuscriptContent(file: Buffer, originalName: string, mimeType: string): Promise<ExtractedContent> {
  const ext = path.extname(originalName).toLowerCase();
  let text = '';

  try {
    if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file });
      text = result.value;
    } else if (ext === '.txt' || ext === '.md' || mimeType === 'text/plain' || mimeType === 'text/markdown') {
      text = file.toString('utf-8');
    } else {
      throw new Error('Unsupported file format');
    }

    const chapters = parseChapters(text);
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const firstLine = text.split('\n')[0].trim();
    const title = firstLine.startsWith('#') ? firstLine.replace(/^#+\s*/, '') : firstLine.length < 100 ? firstLine : undefined;

    return { title, chapters, wordCount };
  } catch (error) {
    console.error('Content extraction error:', error);
    return { chapters: [{ title: 'Chapter 1', content: text || '' }], wordCount: 0 };
  }
}

function parseChapters(text: string): { title: string; content: string }[] {
  const chapters: { title: string; content: string }[] = [];
  const chapterPatterns = [
    /^#{1,2}\s*chapter\s*(\d+|[IVXLC]+)[:\s\-.]*(.*)/gim,
    /^chapter\s*(\d+|[IVXLC]+)[:\s\-.]*(.*)/gim,
    /^#{1,2}\s+(.+)/gm,
  ];

  for (const pattern of chapterPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 1) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];
        const title = match[2]?.trim() || match[1]?.trim() || `Chapter ${i + 1}`;
        const startIndex = match.index! + match[0].length;
        const endIndex = nextMatch ? nextMatch.index : text.length;
        const content = text.slice(startIndex, endIndex).trim();
        if (content.length > 0) chapters.push({ title, content });
      }
      return chapters;
    }
  }

  // No chapters found, treat as single chapter
  chapters.push({ title: 'Chapter 1', content: text.trim() });
  return chapters;
}

export async function deleteUpload(filepath: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises');
    await unlink(path.join(process.cwd(), 'public', filepath));
    return true;
  } catch {
    return false;
  }
}

export default { uploadImage, uploadManuscript, extractManuscriptContent, deleteUpload };
