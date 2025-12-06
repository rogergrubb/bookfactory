import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';

export type ExportFormat = 'epub' | 'pdf' | 'docx' | 'markdown' | 'html';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface BookData {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  genre?: string;
  chapters: Chapter[];
}

interface ExportOptions {
  format: ExportFormat;
  includeTitle?: boolean;
  includeToc?: boolean;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  pageSize?: 'letter' | 'a4' | '6x9';
}

interface ExportResult {
  data: Buffer | string;
  filename: string;
  mimeType: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseHtmlToDocxElements(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const text = htmlToText(html);
  const lines = text.split('\n\n');

  for (const line of lines) {
    if (line.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line.trim() })],
          spacing: { after: 200 },
        })
      );
    }
  }
  return paragraphs;
}

export function generateMarkdown(book: BookData, options: ExportOptions): string {
  let md = '';
  if (options.includeTitle !== false) {
    md += `# ${book.title}\n\n`;
    if (book.subtitle) md += `## ${book.subtitle}\n\n`;
    md += `*By ${book.author}*\n\n`;
    if (book.description) md += `${book.description}\n\n`;
    md += '---\n\n';
  }
  if (options.includeToc !== false && book.chapters.length > 1) {
    md += '## Table of Contents\n\n';
    book.chapters.forEach((ch, i) => {
      md += `${i + 1}. [${ch.title}](#chapter-${ch.order})\n`;
    });
    md += '\n---\n\n';
  }
  book.chapters.forEach((chapter) => {
    md += `## ${chapter.title} {#chapter-${chapter.order}}\n\n`;
    md += htmlToText(chapter.content) + '\n\n';
  });
  return md;
}

export function generateHtml(book: BookData, options: ExportOptions): string {
  const fontSize = options.fontSize || 16;
  const fontFamily = options.fontFamily || 'Georgia, serif';
  const lineHeight = options.lineHeight || 1.8;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${book.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; max-width: 700px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background: #fefefe; }
    h1 { font-size: 2.5em; margin-bottom: 0.5em; text-align: center; }
    h2 { font-size: 1.8em; margin: 2em 0 1em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
    p { margin-bottom: 1em; text-indent: 1.5em; text-align: justify; }
    .title-page { text-align: center; margin-bottom: 4em; page-break-after: always; }
    .chapter { page-break-before: always; }
    @media print { body { max-width: none; padding: 0; } }
  </style>
</head>
<body>`;

  if (options.includeTitle !== false) {
    html += `<div class="title-page"><h1>${book.title}</h1>${book.subtitle ? `<div class="subtitle">${book.subtitle}</div>` : ''}<div class="author">By ${book.author}</div></div>`;
  }

  book.chapters.forEach((chapter) => {
    const content = chapter.content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n');
    html += `<div class="chapter" id="chapter-${chapter.order}"><h2>${chapter.title}</h2>${content}</div>`;
  });

  html += `</body></html>`;
  return html;
}

export async function generateEpub(book: BookData, options: ExportOptions): Promise<Buffer> {
  const zip = new JSZip();
  const uuid = `urn:uuid:${book.id}-${Date.now()}`;

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);

  const manifest = book.chapters.map((ch, i) => `<item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n');
  const spine = book.chapters.map((_, i) => `<itemref idref="chapter${i + 1}"/>`).join('\n');

  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${book.title}</dc:title>
    <dc:creator>${book.author}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
    ${manifest}
  </manifest>
  <spine toc="ncx">${spine}</spine>
</package>`);

  const navPoints = book.chapters.map((ch, i) => `<navPoint id="navpoint-${i + 1}" playOrder="${i + 1}"><navLabel><text>${ch.title}</text></navLabel><content src="chapter${i + 1}.xhtml"/></navPoint>`).join('');

  zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="${uuid}"/><meta name="dtb:depth" content="1"/></head>
  <docTitle><text>${book.title}</text></docTitle>
  <navMap>${navPoints}</navMap>
</ncx>`);

  const navItems = book.chapters.map((ch, i) => `<li><a href="chapter${i + 1}.xhtml">${ch.title}</a></li>`).join('\n');
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Table of Contents</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body><nav epub:type="toc" id="toc"><h1>Table of Contents</h1><ol>${navItems}</ol></nav></body>
</html>`);

  zip.file('OEBPS/style.css', `body { font-family: Georgia, serif; font-size: 16px; line-height: 1.8; margin: 5%; } h1 { font-size: 1.8em; text-align: center; } p { margin: 0 0 0.75em 0; text-indent: 1.5em; }`);

  book.chapters.forEach((chapter, i) => {
    const content = chapter.content.split('\n').filter(p => p.trim()).map((p, idx) => `<p${idx === 0 ? ' class="first"' : ''}>${p}</p>`).join('\n');
    zip.file(`OEBPS/chapter${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${chapter.title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body><div class="chapter-title"><h1>${chapter.title}</h1></div>${content}</body>
</html>`);
  });

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return buffer;
}

export async function generateDocx(book: BookData, options: ExportOptions): Promise<Buffer> {
  const children: any[] = [];

  if (options.includeTitle !== false) {
    children.push(new Paragraph({ children: [new TextRun({ text: book.title, bold: true, size: 56 })], heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
    if (book.subtitle) {
      children.push(new Paragraph({ children: [new TextRun({ text: book.subtitle, size: 32, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
    }
    children.push(new Paragraph({ children: [new TextRun({ text: `By ${book.author}`, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 800 } }));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  book.chapters.forEach((chapter, index) => {
    children.push(new Paragraph({ children: [new TextRun({ text: chapter.title, bold: true, size: 36 })], heading: HeadingLevel.HEADING_1, spacing: { before: index > 0 ? 600 : 0, after: 400 }, pageBreakBefore: index > 0 }));
    children.push(...parseHtmlToDocxElements(chapter.content));
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generatePdf(book: BookData, options: ExportOptions): Promise<Buffer> {
  // Generate print-ready HTML for PDF conversion
  // Users can use browser print or a PDF service
  const html = generateHtml(book, { ...options, includeToc: true, includeTitle: true });
  const printHtml = html.replace('</body>', `<script>window.onload = function() { window.print(); };</script></body>`);
  return Buffer.from(printHtml);
}

export async function exportBook(book: BookData, options: ExportOptions): Promise<ExportResult> {
  const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  switch (options.format) {
    case 'markdown':
      return { data: Buffer.from(generateMarkdown(book, options)), filename: `${safeTitle}.md`, mimeType: 'text/markdown' };
    case 'html':
      return { data: Buffer.from(generateHtml(book, options)), filename: `${safeTitle}.html`, mimeType: 'text/html' };
    case 'epub':
      return { data: await generateEpub(book, options), filename: `${safeTitle}.epub`, mimeType: 'application/epub+zip' };
    case 'docx':
      return { data: await generateDocx(book, options), filename: `${safeTitle}.docx`, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    case 'pdf':
      return { data: await generatePdf(book, options), filename: `${safeTitle}.html`, mimeType: 'text/html' };
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

export default exportBook;
