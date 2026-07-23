import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://16.171.26.53').replace(/\/$/, '');

function getBackendHostHeader() {
    try {
        return new URL(BACKEND_URL).host;
    } catch {
        return '16.171.26.53';
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path, 'PATCH');
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        },
    });
}

async function proxyRequest(
    request: NextRequest,
    path: string[],
    method: string
) {
    // /api/proxy/v1/... -> /api/v1/...
    const fullPath = request.nextUrl.pathname;
    const targetPath = fullPath.replace('/api/proxy', '/api');
    const search = request.nextUrl.search || '';
    const targetUrl = `${BACKEND_URL}${targetPath}${search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (lower === 'host' || lower === 'connection' || lower === 'content-length') {
            return;
        }
        headers.set(key, value);
    });
    headers.set('Host', getBackendHostHeader());

    try {
        let body: string | undefined;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                body = await request.text();
            } catch {
                body = undefined;
            }
        }

        console.log(`Proxying ${method} to:`, targetUrl);

        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
            redirect: 'manual',
        });

        const responseBody = await response.text();

        return new NextResponse(
            response.status === 204 || response.status === 205 || response.status === 304
                ? null
                : responseBody,
            {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {
                detail: 'Failed to connect to backend server. Check BACKEND_URL and that the API is reachable.',
                error: 'Failed to connect to backend server',
            },
            { status: 502 }
        );
    }
}
