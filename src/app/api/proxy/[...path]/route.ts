import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API Proxy Route Handler
 * 
 * This route intercepts all calls to /api/proxy/* and forwards them to the backend API.
 * This pattern is essential for HTTPS frontends (Vercel/Edge) communicating with HTTP backends,
 * avoiding Mixed Content errors in the browser.
 */

async function proxyRequest(request: NextRequest, method: string) {
    try {
        // Extract the path after /api/proxy/
        const url = new URL(request.url);
        const pathMatch = url.pathname.match(/\/api\/proxy\/(.+)/);

        if (!pathMatch) {
            return NextResponse.json(
                { error: 'Invalid proxy path' },
                { status: 400 }
            );
        }

        const targetPath = pathMatch[1];
        const targetUrl = `${API_URL}/${targetPath}${url.search}`;

        // Forward headers, especially Authorization
        const headers = new Headers();
        const authHeader = request.headers.get('Authorization');
        const contentType = request.headers.get('Content-Type');

        if (authHeader) {
            headers.set('Authorization', authHeader);
        }
        if (contentType) {
            headers.set('Content-Type', contentType);
        }

        // Build the fetch options
        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        // Include body for methods that support it
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const body = await request.text();
            if (body) {
                fetchOptions.body = body;
            }
        }

        // Forward the request to the backend
        const response = await fetch(targetUrl, fetchOptions);

        // Get response data
        const contentTypeResponse = response.headers.get('Content-Type');
        let data;

        if (contentTypeResponse?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Return the response with appropriate status
        if (contentTypeResponse?.includes('application/json')) {
            return NextResponse.json(data, { status: response.status });
        }

        return new NextResponse(data, {
            status: response.status,
            headers: { 'Content-Type': contentTypeResponse || 'text/plain' },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {
                error: 'Proxy request failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request, 'DELETE');
}
