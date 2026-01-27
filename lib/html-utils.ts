/**
 * HTML utility functions for safe HTML handling
 */

/**
 * Strip HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use regex
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  // Client-side: use DOM
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Convert HTML to basic formatted text
 * Preserves some structure like line breaks and lists
 * @param html - HTML string to convert
 * @returns Formatted plain text
 */
export function htmlToText(html: string): string {
  if (!html) return '';

  // Replace common block elements with line breaks
  let text = html
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<ul>/gi, '\n')
    .replace(/<ol>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/ol>/gi, '\n');

  // Remove all remaining HTML tags
  text = stripHtml(text);

  // Clean up multiple line breaks
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

/**
 * Sanitize HTML for safe rendering
 * Basic sanitization - removes script tags and dangerous attributes
 * For production use, consider using a library like DOMPurify
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');

  // Remove data: protocol (except data:image)
  sanitized = sanitized.replace(/src\s*=\s*["']data:(?!image)[^"']*["']/gi, '');

  return sanitized;
}
