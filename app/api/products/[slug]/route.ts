import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/woocommerce';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Explicitly use Node.js runtime

// Prevent static generation of this route
export const dynamicParams = true;

/**
 * GET /api/products/[slug]
 * Fetch a single product by slug from WooCommerce
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Fetch product from WooCommerce
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Map WordPress image filenames to local /images/products/ directory
    const toLocalImage = (url: string): string => {
      if (!url || url === '/images/products/placeholder.jpg') return url;
      const filename = url.split('/').pop() || '';
      return `/images/products/${filename}`;
    };

    // Transform WooCommerce data to frontend format
    const transformedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      regularPrice: product.regular_price,
      salePrice: product.sale_price,
      onSale: product.on_sale,
      image: toLocalImage(product.images[0]?.src || '/images/products/placeholder.jpg'),
      images: product.images.map((img) => ({
        id: img.id,
        src: toLocalImage(img.src),
        alt: img.alt || product.name
      })),
      category: product.categories[0]?.name || 'Uncategorized',
      description: product.description,
      shortDescription: product.short_description,
      features: extractFeatures(product.description),
      // Extract plan variations from product attributes
      plans: extractPlans(product),
      stockStatus: product.stock_status,
      stockQuantity: product.stock_quantity
    };

    return NextResponse.json({
      success: true,
      product: transformedProduct
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Extract features from product description HTML
 */
function extractFeatures(description: string): string[] {
  // Basic HTML parsing to extract list items
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi;
  const matches = Array.from(description.matchAll(listItemRegex));
  const features: string[] = [];

  for (const match of matches) {
    // Remove HTML tags from content
    const cleanText = match[1].replace(/<[^>]+>/g, '').trim();
    if (cleanText) {
      features.push(cleanText);
    }
  }

  // If no list items found, return default features
  if (features.length === 0) {
    return [
      'High-speed data connectivity',
      'Easy activation',
      'Reliable network coverage',
      '24/7 customer support'
    ];
  }

  return features;
}

/**
 * Extract plan variations from product attributes
 * Looks for Duration and Data attributes to create plan options
 */
function extractPlans(product: any): any[] {
  // Check if this is a variable product with variations
  if (product.type === 'variable' && product.variations && product.variations.length > 0) {
    // TODO: Fetch variation details if needed
    // For now, return basic structure
    return product.variations.map((variationId: number, index: number) => ({
      id: `plan-${variationId}`,
      duration: `${(index + 1) * 3} Days`,
      dataAmount: 'Unlimited',
      price: parseFloat(product.price),
      regularPrice: parseFloat(product.regular_price),
      recommended: index === 1 // Mark second plan as recommended
    }));
  }

  // For simple products, create a single plan
  return [
    {
      id: `plan-${product.id}`,
      duration: product.attributes.find((attr: any) => attr.name === 'Duration')?.options[0] || '10 Days',
      dataAmount: product.attributes.find((attr: any) => attr.name === 'Data')?.options[0] || 'Unlimited',
      price: parseFloat(product.price),
      regularPrice: parseFloat(product.regular_price || product.price),
      recommended: true
    }
  ];
}
