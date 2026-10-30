import type { DocEntry } from '@/docs/types';
import { ProductCardDemo } from '@/components/commerce/ProductCard';
import { ProductDetailDemo } from '@/components/commerce/ProductDetail';
import { CartDrawerDemo } from '@/components/commerce/CartDrawer';
import { CheckoutDemo } from '@/components/commerce/Checkout';
import { ReviewsDemo } from '@/components/commerce/Reviews';

export const commerceEntries: DocEntry[] = [
  {
    slug: 'product-card',
    name: 'Product Cards',
    description: 'Product cards with frame swatches, a second image on hover, sale and new badges, a wishlist heart and quick add with a size picker.',
    badge: 'New',
    demos: [
      {
        title: 'Shop grid',
        description: 'Hover a card to see the second shot and Quick add. Pick a size to add it to the cart.',
        component: ProductCardDemo,
        height: 760,
        code: `import { ProductCard } from '@/components/commerce/ProductCard';

<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
  {products.map((p) => (
    <ProductCard key={p.id} product={p} onAdd={(p, size, frame) => cart.add(p, { size, frame })} />
  ))}
</div>`,
      },
    ],
    props: [
      { name: 'product', type: 'Product', description: 'Name, price, compareAt, badge, rating, images, swatches and sizes with stock.' },
      { name: 'onAdd', type: '(product, size, frame) => void', description: 'Called when a size is picked from Quick add.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'product-detail',
    name: 'Product Detail',
    description: 'A product page section with a zoomable gallery, frame and size pickers with stock, quantity, an add-to-cart button with states, a delivery estimate and details.',
    badge: 'New',
    demos: [
      {
        title: 'Framed print',
        description: 'Hover the image to zoom. Sold-out sizes are disabled, low stock is flagged, and Add to cart shows loading then success.',
        component: ProductDetailDemo,
        height: 760,
        code: `import { ProductDetail } from '@/components/commerce/ProductDetail';

<ProductDetail
  product={product}
  onAdd={(p, { frame, size, qty }) => cart.add(p, { frame, size, qty })}
/>`,
      },
    ],
    props: [
      { name: 'product', type: 'Product', description: 'The product, including swatches and sizes with stock.' },
      { name: 'onAdd', type: '(product, { frame, size, qty }) => void', description: 'Called after the add-to-cart animation.' },
    ],
  },
  {
    slug: 'cart-drawer',
    name: 'Cart Drawer',
    description: 'A slide-over cart with quantity steppers, remove with undo, a free-shipping progress bar, an upsell and a checkout button.',
    badge: 'New',
    demos: [
      {
        title: 'Slide-over cart',
        description: 'Change quantities, remove an item and undo it, or add the suggested print to cross the free-shipping line.',
        component: CartDrawerDemo,
        height: 600,
        code: `import { CartDrawer } from '@/components/commerce/CartDrawer';

<div className="relative">
  <CartDrawer
    open={open}
    onClose={() => setOpen(false)}
    lines={lines}
    onChange={setLines}
    upsell={suggested}
    onCheckout={goToCheckout}
  />
</div>`,
      },
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Whether the drawer is showing.' },
      { name: 'onClose', type: '() => void', description: 'Called from the backdrop, close button or Escape.' },
      { name: 'lines', type: 'CartLine[]', description: 'Cart lines: product, frame, size and quantity.' },
      { name: 'onChange', type: '(lines: CartLine[]) => void', description: 'Called with the updated lines after any change.' },
      { name: 'upsell', type: 'Product', description: 'Optional product to suggest.' },
      { name: 'onCheckout', type: '() => void', description: 'Checkout button handler.' },
    ],
  },
  {
    slug: 'checkout',
    name: 'Checkout',
    description: 'A one-page checkout with contact, shipping, delivery options, card fields that format and detect the card type, and an order summary with promo codes.',
    badge: 'New',
    demos: [
      {
        title: 'One-page checkout',
        description: 'Type a card number starting with 4, 5, 34 or 6011 to see the card type change. Try the code FIELD15.',
        component: CheckoutDemo,
        height: 900,
        code: `import { Checkout, detectBrand, formatCard } from '@/components/commerce/Checkout';

<Checkout />

// Helpers you can reuse in your own forms
formatCard('4242424242424242'); // "4242 4242 4242 4242"
detectBrand('3714 496353 98431'); // "amex"`,
      },
    ],
    props: [
      { name: 'className', type: 'string', description: 'Extra classes for the checkout card.' },
      { name: 'detectBrand', type: '(number: string) => Brand', description: 'Exported helper: visa, mastercard, amex, discover or null from the number prefix.' },
      { name: 'formatCard', type: '(value: string) => string', description: 'Exported helper: groups digits as 4-4-4-4, or 4-6-5 for Amex.' },
    ],
  },
  {
    slug: 'product-reviews',
    name: 'Reviews',
    description: 'A reviews section with an average rating, distribution bars that filter by stars, helpful votes and a write-a-review dialog with star input.',
    badge: 'New',
    demos: [
      {
        title: 'Reviews with filters',
        description: 'Click a star bar to filter, vote reviews helpful, or write one and see it appear at the top.',
        component: ReviewsDemo,
        height: 620,
        code: `import { Reviews } from '@/components/commerce/Reviews';

<Reviews />`,
      },
    ],
    props: [{ name: 'className', type: 'string', description: 'Extra classes for the reviews card.' }],
  },
];
