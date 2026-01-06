/**
 * Patterns that indicate a default/placeholder image that should be filtered out.
 * These are generic fallback images that don't provide meaningful visual context.
 */
const DEFAULT_IMAGE_PATTERNS = [
  /\/static\/default-[a-f0-9]+\.png$/i, // Sentry blog default images
  /\/default-og-image\./i,
  /\/placeholder\./i,
  /\/fallback\./i,
];

/**
 * Checks if an image URL is a known default/placeholder image.
 */
function isDefaultImage(imageUrl: string): boolean {
  return DEFAULT_IMAGE_PATTERNS.some((pattern) => pattern.test(imageUrl));
}

/**
 * Fetches the Open Graph image URL from a given webpage.
 * This runs at build time in Astro.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AstroBot/1.0)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Try og:image first
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (ogImageMatch) {
      const imageUrl = ogImageMatch[1];
      if (isDefaultImage(imageUrl)) {
        return null;
      }
      return imageUrl;
    }

    // Try reverse order (content before property)
    const ogImageMatchReverse = html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );
    if (ogImageMatchReverse) {
      const imageUrl = ogImageMatchReverse[1];
      if (isDefaultImage(imageUrl)) {
        return null;
      }
      return imageUrl;
    }

    // Try twitter:image as fallback
    const twitterImageMatch = html.match(
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (twitterImageMatch) {
      const imageUrl = twitterImageMatch[1];
      if (isDefaultImage(imageUrl)) {
        return null;
      }
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch OG image for ${url}:`, error);
    return null;
  }
}

/**
 * Fetches OG images for an array of blog posts.
 * Returns the posts with an added `image` property.
 */
export async function enrichBlogPostsWithImages<T extends { url: string }>(
  posts: T[]
): Promise<(T & { image: string | null })[]> {
  const results = await Promise.all(
    posts.map(async (post) => {
      const image = await fetchOgImage(post.url);
      return { ...post, image };
    })
  );
  return results;
}

/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Gets the YouTube thumbnail URL for a video.
 * Uses hqdefault as it's more reliably available than maxresdefault.
 */
export function getYouTubeThumbnail(videoUrl: string): string | null {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Enriches presentations with YouTube thumbnails where available.
 */
export function enrichPresentationsWithThumbnails<
  T extends { video?: string | null }
>(presentations: T[]): (T & { thumbnail: string | null })[] {
  return presentations.map((presentation) => {
    const thumbnail = presentation.video
      ? getYouTubeThumbnail(presentation.video)
      : null;
    return { ...presentation, thumbnail };
  });
}
