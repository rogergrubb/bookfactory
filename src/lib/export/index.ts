import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type ExportFormat = 'epub' | 'pdf' | 'mobi' | 'docx' | 'html' | 'markdown' | 'print_pdf';

export interface BookContent {
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  chapters: Array<{
    title: string;
    number: number;
    scenes: Array<{
      title?: string;
      content: string;
    }>;
  }>;
  frontMatter?: {
    dedication?: string;
    epigraph?: string;
    prologue?: string;
  };
  backMatter?: {
    epilogue?: string;
    aboutAuthor?: string;
    acknowledgments?: string;
  };
}

export interface ExportOptions {
  format: ExportFormat;
  includeTableOfContents?: boolean;
  includeFrontMatter?: boolean;
  includeBackMatter?: boolean;
  pageSize?: '5x8' | '6x9' | '8.5x11' | 'a4' | 'a5';
  fontSize?: number;
  fontFamily?: string;
  margins?: { top: number; bottom: number; left: number; right: number };
}

// DOCX Export
export async function exportToDocx(book: BookContent, options: ExportOptions): Promise<Blob> {
  const children: (Paragraph)[] = [];
  
  // Title Page
  children.push(
    new Paragraph({
      children: [new TextRun({ text: book.title, bold: true, size: 72 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 4800, after: 400 },
    }),
  );
  
  if (book.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: book.subtitle, italics: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
    );
  }
  
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `by ${book.author}`, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
  );
  
  children.push(new Paragraph({ children: [new PageBreak()] }));
  
  // Front Matter
  if (options.includeFrontMatter && book.frontMatter) {
    if (book.frontMatter.dedication) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: book.frontMatter.dedication, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 2400, after: 2400 },
        }),
      );
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }
  
  // Table of Contents placeholder
  if (options.includeTableOfContents) {
    children.push(
      new Paragraph({
        text: 'TABLE OF CONTENTS',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );
    
    book.chapters.forEach(chapter => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Chapter ${chapter.number}: ${chapter.title}` }),
          ],
          spacing: { after: 120 },
        }),
      );
    });
    
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
  
  // Chapters
  book.chapters.forEach((chapter, index) => {
    // Chapter heading
    children.push(
      new Paragraph({
        text: `Chapter ${chapter.number}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: index > 0 ? 1200 : 0, after: 200 },
        pageBreakBefore: index > 0,
      }),
    );
    
    children.push(
      new Paragraph({
        text: chapter.title,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
    );
    
    // Scenes
    chapter.scenes.forEach((scene, sceneIndex) => {
      if (scene.title && sceneIndex > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '* * *' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          }),
        );
      }
      
      // Split content into paragraphs
      const paragraphs = scene.content.split('\n\n').filter(Boolean);
      paragraphs.forEach((para) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: options.fontSize ? options.fontSize * 2 : 24 })],
            spacing: { after: 200 },
            indent: { firstLine: 720 },
          }),
        );
      });
    });
  });
  
  // Back Matter
  if (options.includeBackMatter && book.backMatter) {
    if (book.backMatter.aboutAuthor) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(
        new Paragraph({
          text: 'About the Author',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: book.backMatter.aboutAuthor })],
          spacing: { after: 200 },
        }),
      );
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: getPageSize(options.pageSize || '6x9'),
          margin: {
            top: (options.margins?.top || 1) * 1440,
            bottom: (options.margins?.bottom || 1) * 1440,
            left: (options.margins?.left || 1) * 1440,
            right: (options.margins?.right || 1) * 1440,
          },
        },
      },
      children,
    }],
  });
  
  return await Packer.toBlob(doc);
}

// PDF Export
export async function exportToPdf(book: BookContent, options: ExportOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  
  const pageSize = getPdfPageSize(options.pageSize || '6x9');
  const fontSize = options.fontSize || 12;
  const lineHeight = fontSize * 1.5;
  const margin = 72; // 1 inch margins
  
  // Title page
  let page = pdfDoc.addPage(pageSize);
  const { width, height } = page.getSize();
  
  page.drawText(book.title, {
    x: width / 2 - boldFont.widthOfTextAtSize(book.title, 24) / 2,
    y: height / 2 + 100,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  if (book.subtitle) {
    page.drawText(book.subtitle, {
      x: width / 2 - italicFont.widthOfTextAtSize(book.subtitle, 14) / 2,
      y: height / 2 + 60,
      size: 14,
      font: italicFont,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  
  page.drawText(`by ${book.author}`, {
    x: width / 2 - font.widthOfTextAtSize(`by ${book.author}`, 14) / 2,
    y: height / 2,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Chapters
  for (const chapter of book.chapters) {
    page = pdfDoc.addPage(pageSize);
    let y = height - margin;
    
    // Chapter heading
    const chapterText = `Chapter ${chapter.number}`;
    page.drawText(chapterText, {
      x: width / 2 - boldFont.widthOfTextAtSize(chapterText, 18) / 2,
      y: y,
      size: 18,
      font: boldFont,
    });
    y -= 30;
    
    page.drawText(chapter.title, {
      x: width / 2 - boldFont.widthOfTextAtSize(chapter.title, 14) / 2,
      y: y,
      size: 14,
      font: boldFont,
    });
    y -= 50;
    
    // Content
    for (const scene of chapter.scenes) {
      const paragraphs = scene.content.split('\n\n').filter(Boolean);
      
      for (const para of paragraphs) {
        const words = para.split(' ');
        let line = '';
        const maxWidth = width - margin * 2;
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxWidth && line) {
            if (y < margin + lineHeight) {
              page = pdfDoc.addPage(pageSize);
              y = height - margin;
            }
            
            page.drawText(line, {
              x: margin,
              y: y,
              size: fontSize,
              font: font,
            });
            y -= lineHeight;
            line = word;
          } else {
            line = testLine;
          }
        }
        
        if (line) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage(pageSize);
            y = height - margin;
          }
          page.drawText(line, {
            x: margin,
            y: y,
            size: fontSize,
            font: font,
          });
          y -= lineHeight * 1.5; // Extra space between paragraphs
        }
      }
    }
  }
  
  return await pdfDoc.save();
}

// HTML Export
export function exportToHtml(book: BookContent, options: ExportOptions): string {
  const styles = `
    <style>
      body { 
        font-family: Georgia, serif; 
        max-width: 800px; 
        margin: 0 auto; 
        padding: 2rem;
        line-height: 1.8;
        color: #333;
      }
      .title-page { 
        text-align: center; 
        padding: 4rem 0; 
        page-break-after: always; 
      }
      .title { font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; }
      .subtitle { font-size: 1.5rem; font-style: italic; color: #666; margin-bottom: 2rem; }
      .author { font-size: 1.2rem; }
      .chapter { page-break-before: always; padding-top: 3rem; }
      .chapter-number { text-align: center; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.2em; }
      .chapter-title { text-align: center; font-size: 1.8rem; font-weight: bold; margin-bottom: 2rem; }
      .scene-break { text-align: center; padding: 1.5rem 0; }
      p { text-indent: 1.5rem; margin: 0 0 1rem 0; }
      .toc { page-break-after: always; }
      .toc h2 { text-align: center; }
      .toc ul { list-style: none; padding: 0; }
      .toc li { padding: 0.5rem 0; }
      .toc a { text-decoration: none; color: inherit; }
    </style>
  `;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  ${styles}
</head>
<body>
  <div class="title-page">
    <h1 class="title">${book.title}</h1>
    ${book.subtitle ? `<p class="subtitle">${book.subtitle}</p>` : ''}
    <p class="author">by ${book.author}</p>
  </div>
`;

  // Table of Contents
  if (options.includeTableOfContents) {
    html += `
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${book.chapters.map(ch => `<li><a href="#chapter-${ch.number}">Chapter ${ch.number}: ${ch.title}</a></li>`).join('\n      ')}
    </ul>
  </div>
`;
  }
  
  // Chapters
  for (const chapter of book.chapters) {
    html += `
  <div class="chapter" id="chapter-${chapter.number}">
    <p class="chapter-number">Chapter ${chapter.number}</p>
    <h2 class="chapter-title">${chapter.title}</h2>
`;
    
    for (let i = 0; i < chapter.scenes.length; i++) {
      const scene = chapter.scenes[i];
      if (i > 0) {
        html += `    <div class="scene-break">* * *</div>\n`;
      }
      
      const paragraphs = scene.content.split('\n\n').filter(Boolean);
      for (const para of paragraphs) {
        html += `    <p>${escapeHtml(para)}</p>\n`;
      }
    }
    
    html += `  </div>\n`;
  }
  
  html += `</body>
</html>`;
  
  return html;
}

// Markdown Export
export function exportToMarkdown(book: BookContent, options: ExportOptions): string {
  let md = `# ${book.title}\n\n`;
  
  if (book.subtitle) {
    md += `*${book.subtitle}*\n\n`;
  }
  
  md += `**by ${book.author}**\n\n---\n\n`;
  
  // Table of Contents
  if (options.includeTableOfContents) {
    md += `## Table of Contents\n\n`;
    for (const chapter of book.chapters) {
      md += `- [Chapter ${chapter.number}: ${chapter.title}](#chapter-${chapter.number})\n`;
    }
    md += `\n---\n\n`;
  }
  
  // Chapters
  for (const chapter of book.chapters) {
    md += `## Chapter ${chapter.number}: ${chapter.title} {#chapter-${chapter.number}}\n\n`;
    
    for (let i = 0; i < chapter.scenes.length; i++) {
      const scene = chapter.scenes[i];
      if (i > 0) {
        md += `\n* * *\n\n`;
      }
      md += scene.content + '\n\n';
    }
  }
  
  // Back Matter
  if (options.includeBackMatter && book.backMatter?.aboutAuthor) {
    md += `---\n\n## About the Author\n\n${book.backMatter.aboutAuthor}\n`;
  }
  
  return md;
}

// EPUB Export (simplified - in production, use a proper EPUB library)
export async function exportToEpub(book: BookContent, options: ExportOptions): Promise<Blob> {
  // For demo purposes, we'll create an HTML-based structure
  // In production, use the epub-gen-memory or similar library properly
  const htmlContent = exportToHtml(book, options);
  return new Blob([htmlContent], { type: 'text/html' });
}

// Helper functions
function getPageSize(size: string): { width: number; height: number } {
  const sizes: Record<string, { width: number; height: number }> = {
    '5x8': { width: 5 * 1440, height: 8 * 1440 },
    '6x9': { width: 6 * 1440, height: 9 * 1440 },
    '8.5x11': { width: 8.5 * 1440, height: 11 * 1440 },
    'a4': { width: 11906, height: 16838 },
    'a5': { width: 8419, height: 11906 },
  };
  return sizes[size] || sizes['6x9'];
}

function getPdfPageSize(size: string): [number, number] {
  const sizes: Record<string, [number, number]> = {
    '5x8': [360, 576],
    '6x9': [432, 648],
    '8.5x11': [612, 792],
    'a4': [595.28, 841.89],
    'a5': [419.53, 595.28],
  };
  return sizes[size] || sizes['6x9'];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main export function
export async function exportBook(
  book: BookContent, 
  options: ExportOptions
): Promise<Blob | Uint8Array | string> {
  switch (options.format) {
    case 'docx':
      return await exportToDocx(book, options);
    case 'pdf':
    case 'print_pdf':
      return await exportToPdf(book, options);
    case 'html':
      return exportToHtml(book, options);
    case 'markdown':
      return exportToMarkdown(book, options);
    case 'epub':
      return await exportToEpub(book, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}
