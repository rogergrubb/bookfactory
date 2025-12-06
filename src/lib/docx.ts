// DOCX Generation using docx library
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  TableOfContents,
  StyleLevel,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Packer,
} from 'docx';

interface Chapter {
  title: string;
  content: string;
}

interface DOCXOptions {
  title: string;
  subtitle?: string;
  author: string;
  chapters: Chapter[];
  includeTitlePage?: boolean;
  includeToc?: boolean;
  fontSize?: number;
  fontFamily?: string;
  lineSpacing?: number;
}

// Convert HTML to docx paragraphs
function htmlToParagraphs(html: string, fontSize: number, fontFamily: string, lineSpacing: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // Simple HTML parsing - convert to plain text paragraphs
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong>([^<]*)<\/strong>/gi, '**$1**')
    .replace(/<em>([^<]*)<\/em>/gi, '_$1_')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const parts = text.split('\n\n').filter(p => p.trim().length > 0);

  parts.forEach((part, index) => {
    const runs: TextRun[] = [];
    
    // Handle basic formatting markers
    let currentText = part;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /_([^_]+)_/g;
    
    // Simple approach - just create plain text for now
    // TODO: Parse bold/italic markers into proper TextRuns
    currentText = currentText.replace(boldRegex, '$1').replace(italicRegex, '$1');
    
    runs.push(new TextRun({
      text: currentText,
      font: fontFamily,
      size: fontSize * 2, // docx uses half-points
    }));

    paragraphs.push(new Paragraph({
      children: runs,
      spacing: {
        after: 200,
        line: lineSpacing * 240, // 240 = single spacing
      },
      indent: index === 0 ? {} : { firstLine: 720 }, // 0.5 inch indent except first para
      alignment: AlignmentType.JUSTIFIED,
    }));
  });

  return paragraphs;
}

export async function generateDOCX(options: DOCXOptions): Promise<Buffer> {
  const {
    title,
    subtitle,
    author,
    chapters,
    includeTitlePage = true,
    includeToc = true,
    fontSize = 12,
    fontFamily = 'Times New Roman',
    lineSpacing = 1.5,
  } = options;

  const sections: any[] = [];

  // Title page
  if (includeTitlePage) {
    sections.push({
      properties: {},
      children: [
        new Paragraph({ text: '' }), // Spacing
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 56,
              font: fontFamily,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        ...(subtitle ? [
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: subtitle,
                italics: true,
                size: 32,
                font: fontFamily,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ] : []),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({
              text: `by ${author}`,
              size: 28,
              font: fontFamily,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new PageBreak()],
        }),
      ],
    });
  }

  // Table of contents
  if (includeToc) {
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: 'Contents',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        new TableOfContents('Table of Contents', {
          hyperlink: true,
          headingStyleRange: '1-3',
          stylesWithLevels: [
            new StyleLevel('Heading1', 1),
            new StyleLevel('Heading2', 2),
          ],
        }),
        new Paragraph({
          children: [new PageBreak()],
        }),
      ],
    });
  }

  // Chapters
  chapters.forEach((chapter) => {
    const chapterParagraphs = htmlToParagraphs(chapter.content, fontSize, fontFamily, lineSpacing);
    
    sections.push({
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  italics: true,
                  size: 18,
                  color: '888888',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          text: chapter.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        ...chapterParagraphs,
        new Paragraph({
          children: [new PageBreak()],
        }),
      ],
    });
  });

  const doc = new Document({
    creator: author,
    title: title,
    description: subtitle || `${title} by ${author}`,
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: fontFamily,
            size: fontSize * 2,
          },
          paragraph: {
            spacing: { line: lineSpacing * 240 },
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: fontFamily,
            size: 48,
            bold: true,
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
          },
        },
      ],
    },
    sections,
  });

  return await Packer.toBuffer(doc);
}

export default generateDOCX;
