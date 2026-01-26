# Coding Conventions

## File Naming

### Components
- **PascalCase**: `ProductCard.tsx`, `SinglePageHome.tsx`, `LanguageSwitcher.tsx`
- **One component per file**: Primary export matches filename
- **Colocation**: Related components grouped by feature (`cart/`, `shop/`, `checkout/`)

### Utilities & Hooks
- **camelCase**: `woocommerce.ts`, `useHashNavigation.ts`, `utils.ts`
- **Hook prefix**: All custom hooks start with `use` (`useCart`, `useMediaQuery`)

### API Routes
- **Next.js convention**: `route.ts` for App Router endpoints
- **RESTful naming**: `/api/products`, `/api/orders`, `/api/payment/webhook`

### Configuration Files
- **kebab-case**: `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- **Dotfiles**: `.eslintrc.json`, `.gitignore`, `.env.local`

### Type Definitions
- **Centralized**: `types/index.ts` for shared types
- **Colocation**: Component-specific types in same file

---

## TypeScript Conventions

### Type Definitions

**Prefer interfaces for object shapes**:
```typescript
interface ProductData {
  id: number
  name: string
  price: number
}
```

**Use types for unions, intersections, and utilities**:
```typescript
type ProductType = 'esim' | 'physical'
type ExtendedProduct = ProductData & { featured: boolean }
```

**Explicit return types for functions**:
```typescript
export async function getAllProducts(): Promise<ProductData[]> {
  // Implementation
}
```

**Generic type parameters**:
```typescript
interface ApiResponse<T> {
  data: T
  error?: string
}
```

### Naming Conventions

**Interfaces**: PascalCase with descriptive names
- `ProductData`, `CartItem`, `CheckoutFormData`

**Types**: PascalCase with descriptive names
- `ProductType`, `PaymentMethod`, `OrderStatus`

**Enums**: PascalCase (not used in current codebase - prefer union types)

**Type Parameters**: Single uppercase letter or descriptive PascalCase
- `T`, `Props`, `State`

### Strict Mode

**All files use TypeScript strict mode**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

**No `any` types**: Use `unknown` for truly dynamic data, then narrow with type guards

**Explicit null checks**: Use optional chaining (`?.`) and nullish coalescing (`??`)

---

## React Conventions

### Component Structure

**Consistent component pattern**:
```typescript
'use client' // If client component

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ComponentProps {
  title: string
  items: Item[]
}

export default function Component({ title, items }: ComponentProps) {
  const t = useTranslations('namespace')
  const [state, setState] = useState<Type>(initialValue)

  // Event handlers
  const handleClick = () => { ... }

  // Derived state
  const computedValue = useMemo(() => ..., [dependencies])

  // Effects
  useEffect(() => { ... }, [dependencies])

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

**Order**:
1. 'use client' directive (if needed)
2. Imports (external, then internal)
3. Interface/type definitions
4. Component function
5. Hooks (useState, useEffect, custom hooks)
6. Event handlers
7. Derived state (useMemo, useCallback)
8. Return JSX

### Server vs Client Components

**Default: Server Components**
- All components in `app/` are server components by default
- No `'use client'` needed
- Can fetch data directly

**Explicit Client Components**:
- Use `'use client'` directive at top of file
- Required for:
  - React hooks (useState, useEffect)
  - Browser APIs (localStorage, window)
  - Event handlers (onClick, onChange)
  - Context consumers

**Examples**:
```typescript
// Server Component (default)
export default async function ProductList() {
  const products = await getAllProducts()
  return <ProductGrid products={products} />
}

// Client Component (explicit)
'use client'
export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  return <motion.div>...</motion.div>
}
```

### Props

**Interface for all props**:
```typescript
interface ProductCardProps {
  product: ProductData
  onAddToCart: (product: ProductData) => void
  featured?: boolean  // Optional prop
}
```

**Destructure props in function signature**:
```typescript
export default function ProductCard({ product, onAddToCart, featured = false }: ProductCardProps) {
  // Use props directly
}
```

**Pass objects instead of primitive props** when >3 related values:
```typescript
// Good
<ProductCard product={product} />

// Avoid (too many props)
<ProductCard id={id} name={name} price={price} image={image} />
```

### Hooks

**Custom hooks in `/hooks` directory**

**Hook naming**: Always start with `use`
```typescript
// hooks/useCart.ts
export function useCart() {
  return useCartStore()
}

// hooks/useHashNavigation.ts
export function useHashNavigation(options: Options) {
  // Implementation
}
```

**Hook dependencies**: Explicitly list all dependencies in `useEffect`/`useCallback`/`useMemo`
```typescript
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]) // No missing dependencies
```

---

## Styling Conventions

### Tailwind CSS

**Utility-first approach**:
```typescript
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
```

**Responsive design with mobile-first breakpoints**:
```typescript
<div className="w-full md:w-1/2 lg:w-1/3">
```

**Custom colors from theme**:
```typescript
<button className="bg-dancheong-red hover:bg-red-700 text-white">
```

**Conditional classes with utility function**:
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)}>
```

**Extract repeated patterns to components** (not CSS classes):
```typescript
// Good: Reusable component
<Button variant="primary" size="lg">Click me</Button>

// Avoid: CSS classes for component patterns
<button className="btn btn-primary btn-lg">Click me</button>
```

### CSS Order

**Follow logical property order**:
1. Layout (display, position, flex, grid)
2. Box model (width, height, margin, padding)
3. Visual (background, border, shadow)
4. Typography (font, text, color)
5. Misc (cursor, transition, transform)

**Example**:
```typescript
className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg text-lg font-semibold hover:shadow-lg transition-shadow"
```

---

## Import Conventions

### Import Order

1. External libraries (React, Next.js, third-party)
2. Internal aliases (`@/`)
3. Relative imports (`./`, `../`)
4. Type imports (last, if not inlined)

**Example**:
```typescript
// External libraries
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

// Internal imports
import { ProductCard } from '@/components/shop/ProductCard'
import { useCart } from '@/hooks/useCart'
import { getAllProducts } from '@/lib/woocommerce'

// Relative imports
import { FilterBar } from './FilterBar'

// Type imports
import type { ProductData } from '@/types'
```

### Path Aliases

**Use `@/` for absolute imports** (configured in `tsconfig.json`):
```typescript
// Good
import { ProductCard } from '@/components/shop/ProductCard'

// Avoid (relative)
import { ProductCard } from '../../../components/shop/ProductCard'
```

**Alias mapping**:
- `@/*` → Project root (`/`)
- `@/components/*` → `/components`
- `@/lib/*` → `/lib`
- `@/hooks/*` → `/hooks`

---

## State Management Conventions

### Zustand Stores

**Store file structure**:
```typescript
// stores/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartState {
  // State
  items: CartItem[]

  // Actions
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],

      // Actions (use set for immutable updates)
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      }))
    }),
    { name: 'cart-storage' }
  )
)
```

**Immutable updates**:
```typescript
// Good: Immutable
set((state) => ({ items: [...state.items, newItem] }))

// Avoid: Mutating state
set((state) => {
  state.items.push(newItem)
  return state
})
```

### React Query

**Query keys array format**:
```typescript
// Good: Structured keys
queryKey: ['products', { category, limit }]

// Avoid: String keys
queryKey: 'products-' + category
```

**Query function pattern**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['products', category],
  queryFn: async () => {
    const response = await fetch('/api/products?category=' + category)
    if (!response.ok) throw new Error('Failed to fetch')
    return response.json()
  },
  staleTime: 1000 * 60 * 5
})
```

---

## Error Handling

### API Routes

**Consistent error response format**:
```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

**HTTP status codes**:
- 200: Success
- 400: Bad request (validation error)
- 404: Not found
- 500: Server error

### Client-Side

**React Query error handling**:
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
})

if (isError) {
  return <div>Error: {error.message}</div>
}
```

**Form validation errors**:
```typescript
const {
  register,
  formState: { errors },
  handleSubmit
} = useForm<FormData>({
  resolver: zodResolver(schema)
})

{errors.email && <span>{errors.email.message}</span>}
```

---

## Comments & Documentation

### When to Comment

**Comment "why", not "what"**:
```typescript
// Good: Explains reasoning
// WooCommerce requires customer_id: 0 for guest checkout
await createOrder({ customer_id: 0, ... })

// Avoid: Obvious "what"
// Create order
await createOrder({ ... })
```

**Comment complex logic**:
```typescript
// Calculate intersection ratio to determine active section
// Using 30% threshold to avoid premature section changes
if (entry.intersectionRatio >= 0.3) {
  setActiveSection(entry.target.id)
}
```

**Document edge cases**:
```typescript
// Edge case: PortOne requires merchant_uid to be unique
// If order creation fails, generate new merchant_uid before retry
```

### JSDoc for Public APIs

**Use JSDoc for exported functions**:
```typescript
/**
 * Fetches all products from WooCommerce API
 * @param params - Query parameters (category, limit, etc.)
 * @returns Promise resolving to array of ProductData
 * @throws Error if API request fails
 */
export async function getAllProducts(params?: QueryParams): Promise<ProductData[]> {
  // Implementation
}
```

**Skip JSDoc for React components** (props interface is self-documenting)

---

## Git Commit Conventions

### Commit Message Format

**Structure**: `type(scope): subject`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance (dependencies, config)

**Examples**:
```bash
feat(cart): add quantity controls to cart drawer
fix(checkout): validate phone number format
refactor(products): extract product card to separate component
perf(images): implement lazy loading for product images
```

**Scope**: Feature area (`cart`, `checkout`, `products`, `api`)

**Subject**: Imperative mood, lowercase, no period

---

## Performance Conventions

### Image Optimization

**Always use Next.js Image component**:
```typescript
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"  // Below fold
  priority       // Above fold (hero images)
/>
```

### Code Splitting

**Use dynamic imports for heavy components**:
```typescript
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { ssr: false }  // Client-side only
)
```

### Memoization

**useMemo for expensive computations**:
```typescript
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
)
```

**useCallback for event handlers passed as props**:
```typescript
const handleAddToCart = useCallback(
  (product: ProductData) => addItem({ product, quantity: 1 }),
  [addItem]
)
```

---

## Accessibility Conventions

### Semantic HTML

**Use semantic elements**:
```typescript
// Good
<nav><a href="/shop">Shop</a></nav>
<main><h1>Title</h1><p>Content</p></main>
<footer>© 2026</footer>

// Avoid
<div><div>Shop</div></div>
<div><div>Title</div><div>Content</div></div>
```

### ARIA Labels

**Label interactive elements**:
```typescript
<button
  aria-label="Add to cart"
  onClick={handleAddToCart}
>
  <ShoppingCart />
</button>
```

**Use aria-labelledby for complex labels**:
```typescript
<section aria-labelledby="products-heading">
  <h2 id="products-heading">Our Products</h2>
</section>
```

### Keyboard Navigation

**All interactive elements must be keyboard accessible**:
```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
```

---

## Environment Variables

### Naming Convention

**Next.js convention**:
- `NEXT_PUBLIC_*` - Available in browser (public)
- No prefix - Server-only (secrets)

**Examples**:
```bash
# Public (client-side)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_WOOCOMMERCE_URL=https://82mobile.com
NEXT_PUBLIC_PORTONE_STORE_ID=imp12345678

# Private (server-side only)
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
PORTONE_API_SECRET=secret_xxxxx
```

### Usage

**Client-side (public variables)**:
```typescript
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
```

**Server-side (secrets)**:
```typescript
// Only in API routes or server components
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY
```

---

*Last analyzed: 2026-01-27*
