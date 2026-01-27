import { NextResponse } from 'next/server';

/**
 * Standard API error response structure
 *
 * All API Route Handlers should return errors in this format for consistency.
 */
export interface ApiError {
  success: false;
  error: string;
  message: string;
  code?: string;
}

/**
 * Handle API errors with consistent response structure
 *
 * Handles different error types:
 * - WordPress/WooCommerce errors (error.response?.data)
 * - Network errors (ECONNREFUSED, ETIMEDOUT)
 * - Generic errors
 *
 * @param error - The error object
 * @param context - Context string describing where the error occurred
 * @returns NextResponse with standardized error structure
 *
 * @example
 * try {
 *   const data = await fetchFromWordPress();
 *   return NextResponse.json({ success: true, data });
 * } catch (error) {
 *   return handleApiError(error, 'fetchFromWordPress');
 * }
 */
export function handleApiError(error: any, context: string): NextResponse<ApiError> {
  console.error(`[${context}] Error:`, error);

  // Handle WordPress/WooCommerce API errors
  if (error.response?.data) {
    const wpError = error.response.data;
    return NextResponse.json(
      {
        success: false,
        error: wpError.code || 'wordpress_error',
        message: wpError.message || 'WordPress API error occurred',
        code: wpError.code,
      },
      { status: error.response.status || 500 }
    );
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED') {
    return NextResponse.json(
      {
        success: false,
        error: 'connection_refused',
        message: 'Unable to connect to WordPress backend. Please check if the server is running.',
        code: 'ECONNREFUSED',
      },
      { status: 503 }
    );
  }

  if (error.code === 'ETIMEDOUT') {
    return NextResponse.json(
      {
        success: false,
        error: 'connection_timeout',
        message: 'Request to WordPress backend timed out. Please try again.',
        code: 'ETIMEDOUT',
      },
      { status: 504 }
    );
  }

  // Handle generic errors
  const errorMessage = error.message || 'An unexpected error occurred';
  return NextResponse.json(
    {
      success: false,
      error: 'internal_error',
      message: errorMessage,
      code: error.code,
    },
    { status: 500 }
  );
}

/**
 * Create a standardized error response
 *
 * Helper function for creating consistent error responses when you don't have an error object.
 *
 * @param error - Error type/code
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param code - Optional error code
 * @returns NextResponse with error structure
 *
 * @example
 * if (!productId) {
 *   return createErrorResponse('missing_parameter', 'Product ID is required', 400);
 * }
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 400,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      code,
    },
    { status }
  );
}
