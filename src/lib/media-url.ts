/**
 * Normalize profile image URLs for display in the portal.
 *
 * Use the absolute URL from the API directly in <img> (no CORS needed for display).
 * If the backend returns a relative path, prefix BACKEND origin.
 */

const BACKEND_ORIGIN = (
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
        ? process.env.NEXT_PUBLIC_BACKEND_URL
        : 'http://16.171.26.53'
).replace(/\/$/, '');

export function toDisplayImageUrl(
    url: string | null | undefined,
    options?: { cacheBust?: boolean }
): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('/api/')) return url;

    let display = url;

    // Relative media path → absolute backend URL
    if (url.startsWith('/')) {
        display = `${BACKEND_ORIGIN}${url}`;
    }

    if (options?.cacheBust) {
        const sep = display.includes('?') ? '&' : '?';
        display = `${display}${sep}t=${Date.now()}`;
    }

    return display;
}
