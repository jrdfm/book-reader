import { pdfjs } from 'react-pdf';
import JSZip from 'jszip';
import type { BookContent, PageMetadata } from '../types';

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
  const pages: PageMetadata[] = [];
  const allParagraphs: string[] = [];
  let combinedText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Group items by their y-coordinate to identify paragraphs
    const lineMap = new Map<number, string[]>();
    content.items.forEach((item: any) => {
      if ('str' in item) {
        const y = Math.round(item.transform[5]); // y-coordinate
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)?.push(item.str);
      }
    });

    // Convert lines to paragraphs
    const sortedYCoords = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    sortedYCoords.forEach((y, index) => {
      const line = lineMap.get(y)?.join(' ') || '';
      
      // If line is very short or ends with sentence-ending punctuation,
      // it might be the end of a paragraph
      if (line.trim().length < 50 || /[.!?]$/.test(line.trim())) {
        currentParagraph.push(line);
        if (index === sortedYCoords.length - 1 || 
            (lineMap.get(sortedYCoords[index + 1])?.join(' ').trim().length || 0) > 50) {
          paragraphs.push(currentParagraph.join(' ').trim());
          currentParagraph = [];
        }
      } else {
        currentParagraph.push(line);
      }
    });

    // Add any remaining paragraph
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' ').trim());
    }

    // Filter out empty paragraphs and page numbers
    const filteredParagraphs = paragraphs
      .filter(p => p.trim().length > 0)
      .filter(p => !/^\d+$/.test(p.trim())); // Remove standalone page numbers

    // Record page metadata
    const startIndex = allParagraphs.length;
    allParagraphs.push(...filteredParagraphs);
    const endIndex = allParagraphs.length - 1;
    
    pages.push({
      pageNumber: i,
      startParagraphIndex: startIndex,
      endParagraphIndex: endIndex
    });

    // Add page marker and paragraphs to combined text
    combinedText += filteredParagraphs.join('\n\n') + '\n\n';
  }

  return {
    text: combinedText.trim(),
    title: file.name.replace('.pdf', ''),
    format: 'pdf',
    pages,
    originalParagraphStructure: true
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