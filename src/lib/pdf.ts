// PDF Generation using @react-pdf/renderer
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { createElement } from 'react';

// Register fonts
Font.register({
  family: 'Merriweather',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/merriweather@4.5.0/files/merriweather-latin-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/merriweather@4.5.0/files/merriweather-latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/merriweather@4.5.0/files/merriweather-latin-400-italic.woff', fontWeight: 400, fontStyle: 'italic' },
  ],
});

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/open-sans@4.5.0/files/open-sans-latin-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/open-sans@4.5.0/files/open-sans-latin-700-normal.woff', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margins
    fontFamily: 'Merriweather',
    fontSize: 11,
    lineHeight: 1.6,
  },
  titlePage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  author: {
    fontSize: 16,
    textAlign: 'center',
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 30,
    textAlign: 'center',
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'dotted',
  },
  tocChapter: {
    fontSize: 12,
  },
  tocPage: {
    fontSize: 12,
    color: '#666',
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 30,
    textAlign: 'center',
    paddingTop: 50,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
    textIndent: 24,
  },
  firstParagraph: {
    marginBottom: 12,
    textAlign: 'justify',
    textIndent: 0,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 72,
    right: 72,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
    fontStyle: 'italic',
  },
});

interface Chapter {
  title: string;
  content: string;
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  author: string;
  chapters: Chapter[];
  includeTitlePage?: boolean;
  includeToc?: boolean;
  fontSize?: number;
  fontFamily?: 'Merriweather' | 'Open Sans';
  pageSize?: 'A4' | 'A5' | 'LETTER' | '6x9';
}

// Convert HTML to plain text paragraphs
function htmlToText(html: string): string[] {
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return text.split('\n\n').filter(p => p.trim().length > 0);
}

// Page size dimensions
const pageSizes = {
  'A4': { width: 595.28, height: 841.89 },
  'A5': { width: 419.53, height: 595.28 },
  'LETTER': { width: 612, height: 792 },
  '6x9': { width: 432, height: 648 },
};

export function createBookPDF(options: PDFOptions) {
  const {
    title,
    subtitle,
    author,
    chapters,
    includeTitlePage = true,
    includeToc = true,
    fontSize = 11,
    fontFamily = 'Merriweather',
    pageSize = '6x9',
  } = options;

  const size = pageSizes[pageSize];

  const customStyles = StyleSheet.create({
    page: {
      ...styles.page,
      fontSize,
      fontFamily,
      width: size.width,
      height: size.height,
    },
  });

  const pages: any[] = [];

  // Title page
  if (includeTitlePage) {
    pages.push(
      createElement(Page, { key: 'title', size: [size.width, size.height], style: customStyles.page },
        createElement(View, { style: styles.titlePage },
          createElement(Text, { style: styles.title }, title),
          subtitle && createElement(Text, { style: styles.subtitle }, subtitle),
          createElement(Text, { style: styles.author }, `by ${author}`)
        )
      )
    );
  }

  // Table of contents
  if (includeToc) {
    pages.push(
      createElement(Page, { key: 'toc', size: [size.width, size.height], style: customStyles.page },
        createElement(Text, { style: styles.tocTitle }, 'Contents'),
        ...chapters.map((chapter, index) =>
          createElement(View, { key: `toc-${index}`, style: styles.tocItem },
            createElement(Text, { style: styles.tocChapter }, chapter.title),
            createElement(Text, { style: styles.tocPage }, String(index + (includeTitlePage ? 3 : 2)))
          )
        )
      )
    );
  }

  // Chapter pages
  chapters.forEach((chapter, chapterIndex) => {
    const paragraphs = htmlToText(chapter.content);
    
    pages.push(
      createElement(Page, { 
        key: `chapter-${chapterIndex}`, 
        size: [size.width, size.height], 
        style: customStyles.page 
      },
        createElement(Text, { style: styles.header }, title),
        createElement(Text, { style: styles.chapterTitle }, chapter.title),
        ...paragraphs.map((para, paraIndex) =>
          createElement(Text, { 
            key: `para-${paraIndex}`, 
            style: paraIndex === 0 ? styles.firstParagraph : styles.paragraph 
          }, para)
        ),
        createElement(Text, { 
          style: styles.pageNumber, 
          render: ({ pageNumber }) => `${pageNumber}` 
        })
      )
    );
  });

  return createElement(Document, {}, ...pages);
}

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  const doc = createBookPDF(options);
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default generatePDF;
