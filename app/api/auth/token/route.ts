import { NextResponse } from 'next/server';
import { getJwtToken } from '@/lib/wordpress-auth';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/token
 * Generate JWT token by authenticating with WordPress
 *
 * Request body: { username: string, password: string }
 * Response: { success: true, token: string, user: { id, email, displayName } }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Username and password are required',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    // Call WordPress JWT Authentication plugin
    const result = await getJwtToken(username, password);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          message: 'Invalid username or password',
          code: 'AUTH_FAILED'
        },
        { status: 401 }
      );
    }

    // Create success response
    const response = NextResponse.json({
      success: true,
      token: result.token,
      user: result.user
    });

    // Set httpOnly cookie for secure token storage
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('[auth/token] JWT generation error:', error);
    return handleApiError(error, 'auth/token');
  }
}
