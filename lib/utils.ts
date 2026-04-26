/**
 * Converts common Google Drive link formats into a direct image URL
 * that can be used in <img> tags.
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return 'https://via.placeholder.com/400x200';

  // Handle Google Drive links
  if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
    const match = url.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9_-]{25,})/);
    if (match && match[1]) {
      // Use the newer lh3 format which is much more reliable
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  return url;
}
