import { WooProduct, WooOrder } from '../woocommerce';

/**
 * Generic API response wrapper
 *
 * All API routes should return responses matching this structure.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Product list API response
 */
export interface ProductsResponse {
  success: true;
  data: {
    products: WooProduct[];
    total: number;
    page: number;
    totalPages: number;
  };
}

/**
 * Single product API response
 */
export interface ProductResponse {
  success: true;
  data: {
    product: WooProduct;
  };
}

/**
 * Order API response
 */
export interface OrderResponse {
  success: true;
  data: {
    order: WooOrder;
  };
}

/**
 * Cart item structure (CoCart format)
 */
export interface CartItem {
  item_key: string;
  id: number;
  name: string;
  title: string;
  price: string;
  quantity: {
    value: number;
    min_purchase: number;
    max_purchase: number;
  };
  totals: {
    subtotal: number;
    subtotal_tax: number;
    total: number;
    tax: number;
  };
  slug: string;
  meta: {
    product_type: string;
    sku: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      unit: string;
    };
    weight: number;
    variation: Array<{
      attribute: string;
      value: string;
    }>;
  };
  featured_image: string;
}

/**
 * Cart API response (CoCart format)
 */
export interface CartResponse {
  success: true;
  data: {
    cart_hash: string;
    cart_key: string;
    currency: {
      currency_code: string;
      currency_symbol: string;
      currency_minor_unit: number;
      currency_decimal_separator: string;
      currency_thousand_separator: string;
      currency_prefix: string;
      currency_suffix: string;
    };
    customer: {
      billing_address: {
        billing_first_name: string;
        billing_last_name: string;
        billing_company: string;
        billing_country: string;
        billing_address_1: string;
        billing_address_2: string;
        billing_postcode: string;
        billing_city: string;
        billing_state: string;
        billing_phone: string;
        billing_email: string;
      };
      shipping_address: {
        shipping_first_name: string;
        shipping_last_name: string;
        shipping_company: string;
        shipping_country: string;
        shipping_address_1: string;
        shipping_address_2: string;
        shipping_postcode: string;
        shipping_city: string;
        shipping_state: string;
      };
    };
    items: CartItem[];
    item_count: number;
    items_weight: number;
    coupons: any[];
    needs_payment: boolean;
    needs_shipping: boolean;
    shipping: {
      total_packages: number;
      show_package_details: boolean;
      has_calculated_shipping: boolean;
      packages: any[];
    };
    fees: any[];
    taxes: any[];
    totals: {
      subtotal: string;
      subtotal_tax: string;
      fee_total: string;
      fee_tax: string;
      discount_total: string;
      discount_tax: string;
      shipping_total: string;
      shipping_tax: string;
      total: string;
      total_tax: string;
    };
    removed_items: any[];
    cross_sells: any[];
    notices: any[];
  };
}

/**
 * JWT authentication token response
 */
export interface AuthTokenResponse {
  success: true;
  data: {
    token: string;
    user: {
      email: string;
      displayName: string;
    };
  };
}

/**
 * JWT token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: {
    data: {
      user: {
        id: string;
      };
    };
    iat: number;
    exp: number;
  };
}
