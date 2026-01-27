import { z } from 'zod';

/**
 * Environment variable validation schema
 *
 * Validates all required environment variables at runtime with clear error messages.
 * Uses lazy validation to avoid breaking builds when env vars aren't yet set.
 */
const envSchema = z.object({
  // WordPress & WooCommerce Configuration
  WORDPRESS_URL: z.string().url('WORDPRESS_URL must be a valid URL'),
  WC_CONSUMER_KEY: z.string().startsWith('ck_', 'WC_CONSUMER_KEY must start with "ck_"'),
  WC_CONSUMER_SECRET: z.string().startsWith('cs_', 'WC_CONSUMER_SECRET must start with "cs_"'),

  // JWT Authentication
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),

  // CoCart API Configuration
  COCART_API_URL: z.string().url('COCART_API_URL must be a valid URL').optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Cached validated environment variables
 */
let cachedEnv: Env | null = null;

/**
 * Validate environment variables
 *
 * Uses lazy validation - validates on first access, not at module load.
 * This prevents build failures when env vars aren't yet set.
 *
 * @returns Validated environment variables
 * @throws {Error} If validation fails with descriptive error message
 */
export function validateEnv(): Env {
  // Return cached result if already validated
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    // Parse and validate environment variables
    const parsed = envSchema.parse({
      WORDPRESS_URL: process.env.WORDPRESS_URL,
      WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY,
      WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
      COCART_API_URL: process.env.COCART_API_URL || `${process.env.WORDPRESS_URL}/wp-json/cocart/v2`,
      NODE_ENV: process.env.NODE_ENV || 'development',
    });

    // Cache the result
    cachedEnv = parsed;
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors for readability
      const errorMessages = error.errors.map((err) => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `Environment variable validation failed:\n${errorMessages}\n\n` +
        `Please check your .env file and ensure all required variables are set correctly.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 *
 * Lazy-initialized constant that validates env vars on first access.
 * Use this instead of process.env directly to ensure type safety.
 *
 * @example
 * import { env } from '@/lib/env';
 * const wordpressUrl = env.WORDPRESS_URL;
 */
export const env = new Proxy({} as Env, {
  get(target, prop) {
    const validated = validateEnv();
    return validated[prop as keyof Env];
  },
});
