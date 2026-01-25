import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize WooCommerce API client
export const woo = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL || "https://82mobile.com",
  consumerKey: process.env.WC_CONSUMER_KEY || "",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "",
  version: "wc/v3",
  queryStringAuth: true, // Force Basic Authentication for all requests
});

// Type definitions for WooCommerce products
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'grouped' | 'external' | 'variable';
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  date_created?: string;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }>;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  meta_data?: Array<{
    id?: number;
    key: string;
    value: any;
  }>;
}

/**
 * Fetch all products with optional pagination
 * @param page - Page number (default: 1)
 * @param perPage - Products per page (default: 10)
 * @returns Array of WooCommerce products
 */
export async function getProducts(
  page: number = 1,
  perPage: number = 10
): Promise<WooProduct[]> {
  try {
    const { data } = await woo.get("products", {
      page,
      per_page: perPage,
      status: 'publish',
    });
    return data as WooProduct[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug
 * @param slug - Product slug
 * @returns Single WooCommerce product or null
 */
export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  try {
    const { data } = await woo.get("products", {
      slug,
      status: 'publish',
    });
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch products by category
 * @param categoryId - WooCommerce category ID
 * @param page - Page number
 * @param perPage - Products per page
 * @returns Array of products in category
 */
export async function getProductsByCategory(
  categoryId: number,
  page: number = 1,
  perPage: number = 10
): Promise<WooProduct[]> {
  try {
    const { data } = await woo.get("products", {
      category: categoryId,
      page,
      per_page: perPage,
      status: 'publish',
    });
    return data as WooProduct[];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
}

/**
 * Create a new order in WooCommerce
 * @param orderData - Order data including line items and billing info
 * @returns Created order
 */
export async function createOrder(orderData: Partial<WooOrder>): Promise<WooOrder | null> {
  try {
    const { data } = await woo.post("orders", orderData);
    return data as WooOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

/**
 * Get order by ID
 * @param orderId - Order ID
 * @returns Order details
 */
export async function getOrder(orderId: number): Promise<WooOrder | null> {
  try {
    const { data } = await woo.get(`orders/${orderId}`);
    return data as WooOrder;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }
}

/**
 * Update order status
 * @param orderId - Order ID
 * @param status - New order status
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<WooOrder | null> {
  try {
    const { data } = await woo.put(`orders/${orderId}`, { status });
    return data as WooOrder;
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return null;
  }
}

/**
 * Get product categories
 * @returns Array of WooCommerce categories
 */
export async function getCategories() {
  try {
    const { data } = await woo.get("products/categories", {
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
