import { pdfjs } from 'react-pdf';
import JSZip from 'jszip';
import type { BookContent } from '../types';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function parseFile(file: File): Promise<BookContent> {
  const fileType = file.type;

  switch (fileType) {
    case 'application/pdf':
      return parsePDF(file);
    case 'application/epub+zip':
      return parseEPUB(file);
    case 'text/plain':
      return parseText(file);
    default:
      throw new Error('Unsupported file type');
  }
}

async function parsePDF(file: File): Promise<BookContent> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    text += pageText + '\n\n';
  }

  return {
    text: text.trim(),
    title: file.name.replace('.pdf', ''),
    format: 'pdf',
  };
}

async function parseEPUB(file: File): Promise<BookContent> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new JSZip();
  const epub = await zip.loadAsync(arrayBuffer);
  
  // Find the content file (usually in OEBPS/content.opf)
  const contentFile = Object.keys(epub.files).find((path) =>
    path.endsWith('content.opf')
  );

  if (!contentFile) {
    throw new Error('Invalid EPUB format');
  }

  // Parse the content file to get metadata and text
  const content = await epub.file(contentFile)?.async('string');
  if (!content) {
    throw new Error('Could not read EPUB content');
  }

  // Basic parsing - in a real app, you'd want to properly parse the XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'application/xml');
  
  // Get title
  const titleElement = doc.querySelector('title');
  const title = titleElement?.textContent || file.name.replace('.epub', '');

  // Get author
  const authorElement = doc.querySelector('creator');
  const author = authorElement?.textContent || undefined;

  // Get text content from HTML files
  let text = '';
  const htmlFiles = Object.keys(epub.files).filter((path) =>
    path.endsWith('.html') || path.endsWith('.xhtml')
  );

  for (const htmlFile of htmlFiles) {
    const htmlContent = await epub.file(htmlFile)?.async('string');
    if (htmlContent) {
      const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
      text += htmlDoc.body.textContent + '\n\n';
    }
  }

  return {
    text: text.trim(),
    title,
    author,
    format: 'epub',
  };
}

async function parseText(file: File): Promise<BookContent> {
  const text = await file.text();
  return {
    text: text.trim(),
    title: file.name.replace('.txt', ''),
    format: 'text',
  };
} 