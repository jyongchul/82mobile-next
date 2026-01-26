import { z } from 'zod';

/**
 * Checkout form validation schema
 *
 * Guest checkout requires: email, name, phone
 * Address fields optional for eSIM products
 */
export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g., +821012345678)'),

  // Optional address fields for eSIM
  address1: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional()
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Default form values for Korean customers
 */
export const defaultCheckoutValues: Partial<CheckoutFormData> = {
  country: 'KR'
};
