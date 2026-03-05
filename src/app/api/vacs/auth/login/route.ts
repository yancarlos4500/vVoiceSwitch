/**
 * VACS Auth: Initiate VATSIM Connect OAuth2 Login
 *
 * Proxies the VACS server's /auth/vatsim/login endpoint.
 * Returns a JSON object with { url } pointing to the VATSIM Connect auth page.
 *
 * Flow:
 *   1. Client calls GET /api/vacs/auth/login
 *   2. We call VACS server's /auth/vatsim/login
 *   3. Return the OAuth2 authorization URL to the client
 *   4. Client opens the URL (popup or redirect)
 */

import { NextResponse } from 'next/server';

// Default to dev server; can be overridden with env var
const VACS_BASE_URL = process.env.VACS_BASE_URL || 'https://dev.vacs.network';

export async function GET() {
  try {
    const response = await fetch(`${VACS_BASE_URL}/auth/vatsim/login`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error('[VACS Auth] Login init failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to initiate VACS login' },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Forward any cookies from the VACS server (session tracking)
    const setCookie = response.headers.get('set-cookie');
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (setCookie) {
      headers.set('Set-Cookie', setCookie);
    }

    return new NextResponse(JSON.stringify(data), { headers });
  } catch (error) {
    console.error('[VACS Auth] Error initiating login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
