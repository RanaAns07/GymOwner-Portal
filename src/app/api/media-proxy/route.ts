import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://16.171.26.53').replace(/\/$/, '');

/**
 * Same-origin media proxy so avatars can load when the API returns an absolute
 * backend URL (avoids referrer / mixed-host quirks).
 *
 * Usage: /api/media-proxy?url=http://16.171.26.53/profile_images/...
 */
export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get('url');
    if (!raw) {
        return NextResponse.json({ detail: 'Missing url' }, { status: 400 });
    }

    let target: URL;
    try {
        target = new URL(raw);
    } catch {
        return NextResponse.json({ detail: 'Invalid url' }, { status: 400 });
    }

    // Only proxy our backend host
    let backendHost: string;
    try {
        backendHost = new URL(BACKEND_URL).host;
    } catch {
        backendHost = '16.171.26.53';
    }
    if (target.host !== backendHost) {
        return NextResponse.json({ detail: 'Host not allowed' }, { status: 403 });
    }

    try {
        const upstream = await fetch(target.toString(), {
            headers: { Accept: 'image/*,*/*' },
            redirect: 'follow',
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { detail: 'Media not found' },
                { status: upstream.status }
            );
        }

        const contentType = upstream.headers.get('Content-Type') || 'image/jpeg';
        const buffer = await upstream.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Media proxy error:', error);
        return NextResponse.json({ detail: 'Failed to fetch media' }, { status: 502 });
    }
}
