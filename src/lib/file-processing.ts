import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
if (typeof window === 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Extracts text from a PDF file.
 * @param pdfDataUrl The Data URL of the PDF file.
 * @returns The extracted text content.
 */
export async function extractTextFromPDF(pdfDataUrl: string): Promise<string> {
  try {
    // Convert the data URL to an ArrayBuffer
    const base64Data = pdfDataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: bytes.buffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n${textItems}\n`;
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return `[Unable to extract PDF content. Error: ${error.message}]`;
  }
}

/**
 * Processes all attachment files.
 * @param attachments An array of attachments.
 * @returns The extracted content from the attachments.
 */
export async function processAttachments(attachments: any[]): Promise<string> {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return '';
  }
  
  let extractedContent = '';
  
  for (const attachment of attachments) {
    console.log('Processing attachment:', {
      name: attachment.name,
      contentType: attachment.contentType,
    });
    
    // Handle PDF files
    if (attachment.contentType === 'application/pdf' && attachment.url) {
      console.log('Extracting content from PDF:', attachment.name);
      const pdfText = await extractTextFromPDF(attachment.url);
      extractedContent += `\n\nContent from PDF file "${attachment.name}":\n${pdfText}\n\n`;
    }
    
    // Additional file types (e.g., CSV, DOCX, etc.) can be handled here.
  }
  
  return extractedContent;
}