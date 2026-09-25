import { Product, BundleOffer, Order, FreeGift } from '../types/store';

// Default complimentary bundle bonus perk for "Buy 2 Offer"
export const DEFAULT_FREE_GIFT: FreeGift = {
  id: 'bundle-bonus-care',
  name: 'Complimentary Pet Care Essential Pack',
  description: 'Special companion care multi-pack included with qualifying multi-item orders.',
  value: 0,
  image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
};

export const INITIAL_BUNDLE_OFFER: BundleOffer = {
  id: 'bundle-multi-item-deal',
  title: 'Multi-Item Offer: Buy Any 2 Products, Save More!',
  subtitle: 'Add 2 or more eligible pet products to your cart to automatically activate multi-item bundle savings and free priority dispatch.',
  requiredQuantity: 2,
  freeGift: DEFAULT_FREE_GIFT,
  active: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'lzg-bed-01',
    name: 'CloudSupport Orthopedic Memory Foam Pet Bed',
    category: 'Dogs',
    price: 68.0,
    compareAtPrice: 95.0,
    description: 'Engineered with dual-layer human-grade orthopedic memory foam and waterproof, machine-washable velvet micro-suede cover. Provides optimal spine alignment and joint pressure relief for dogs and cats.',
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    stockCount: 18,
    image: '/src/assets/images/product_orthopedic_bed_1790283966759.jpg',
    features: [
      'Dual-layer medical grade memory foam',
      'Waterproof internal breathable lining',
      'Removable, machine washable non-shrink cover',
      'Non-skid silicone dotted base'
    ],
    tags: ['Best Seller', 'Joint Relief', 'Orthopedic'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-fountain-02',
    name: 'WhiskerCalm Ultra-Quiet Smart Water Fountain',
    category: 'Cats',
    price: 44.0,
    compareAtPrice: 58.0,
    description: 'Medical-grade 304 stainless steel drinking basin with 4-stage active coconut carbon filtration and an ultra-silent (<20dB) magnetic levitation submersible pump. Encourages maximum hydration.',
    rating: 4.8,
    reviewsCount: 94,
    inStock: true,
    stockCount: 24,
    image: '/src/assets/images/product_smart_water_fountain_1790283977812.jpg',
    features: [
      '304 Food-grade hygienic stainless steel top',
      'Triple action filtration with ion exchange resin',
      'Whisper-quiet magnetic drive pump (< 20dB)',
      'Intelligent LED water level indicator'
    ],
    tags: ['Hydration', 'Ultra-Quiet', 'Veterinarian Recommended'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-collar-03',
    name: 'Heritage Cognac Full-Grain Leather Collar & Leash',
    category: 'Dogs',
    price: 34.0,
    compareAtPrice: 48.0,
    description: 'Handcrafted from vegetable-tanned Italian saddle leather with solid brushed brass hardware. Features rolled soft edges to eliminate chafing and develop a rich patina over years of use.',
    rating: 4.9,
    reviewsCount: 81,
    inStock: true,
    stockCount: 15,
    image: '/src/assets/images/product_leather_collar_leash_1790283986428.jpg',
    features: [
      'Full-grain vegetable-tanned leather',
      'Corrosion-proof solid brass D-ring & clasp',
      'Smooth hand-burnished edges that prevent fur pulling',
      'Weather-resistant natural beeswax finish'
    ],
    tags: ['Handcrafted', 'Luxury', 'Durable'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-feeder-04',
    name: 'Ergonomic Ceramic Slow-Feeder Raised Bowl',
    category: 'Dogs',
    price: 28.0,
    compareAtPrice: 38.0,
    description: 'Heavyweight anti-bloat ceramic maze feeder set on a solid FSC-certified bamboo riser. Slows eating pace up to 10x to prevent choking, regurgitation, and canine gastric dilatation-volvulus.',
    rating: 4.7,
    reviewsCount: 65,
    inStock: true,
    stockCount: 20,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    features: [
      'Lead-free, cadmium-free glazed ceramic',
      'Elevated 15° tilted bamboo anti-vomit stand',
      'Dishwasher & microwave safe bowl',
      'Reduces neck strain in senior pets'
    ],
    tags: ['Anti-Gulping', 'Digestive Health', 'Eco-Friendly'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-groom-05',
    name: 'ProTrim Cordless Low-Vibration Pet Grooming Kit',
    category: 'Care & Grooming',
    price: 48.0,
    compareAtPrice: 65.0,
    description: 'Professional-grade pet hair clipper with hypoallergenic ceramic titanium blades and precision 5-speed dial. Low vibration (under 50dB) ensures nervous dogs and cats stay relaxed.',
    rating: 4.8,
    reviewsCount: 112,
    inStock: true,
    stockCount: 12,
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    features: [
      'Titanium acute-angle blade + movable ceramic blade',
      '3-hour rechargeable lithium-ion battery',
      '4 guide comb guards (3mm, 6mm, 9mm, 12mm)',
      'Low noise and vibration to soothe anxiety'
    ],
    tags: ['Quiet Grooming', 'Rechargeable', 'Pro Series'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-toy-06',
    name: 'Nordic Pure Wool Interactive Felt Ball & Feather Wand Set',
    category: 'Toys & Accessories',
    price: 19.0,
    compareAtPrice: 26.0,
    description: 'Hand-felted 100% New Zealand natural sheep wool balls infused with organic Canadian catnip, paired with a solid birch wood telescopic feather teaser wand.',
    rating: 4.9,
    reviewsCount: 73,
    inStock: true,
    stockCount: 30,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    features: [
      '100% Chemical-free organic New Zealand wool',
      'Natural pheasant & guinea fowl cruelty-free feathers',
      'Reinforced braided Kevlar core cord',
      'Stimulates hunting instinct & physical play'
    ],
    tags: ['Natural Toy', 'Organic Catnip', 'Zero Plastic'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-harness-07',
    name: 'AirFlex No-Pull Reflective Step-In Dog Harness',
    category: 'Dogs',
    price: 36.0,
    compareAtPrice: 49.0,
    description: 'Custom-molded breathable honeycomb air-mesh harness with front and back dual zinc-alloy leash attachment points. Prevents trachea pulling while keeping dogs cool on long walks.',
    rating: 4.8,
    reviewsCount: 156,
    inStock: true,
    stockCount: 22,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    features: [
      'Front chest D-ring for gentle pull redirection',
      '360° high-visibility 3M Scotchlite reflective piping',
      'Rapid release military-grade Duraflex buckles',
      'Padded neoprene handle for emergency control'
    ],
    tags: ['No-Pull', 'Night Safe', 'Breathable'],
    isBundleEligible: true,
  },
  {
    id: 'lzg-care-08',
    name: 'Botanical Tear-Free Pet Shampoo & Conditioner Duo',
    category: 'Care & Grooming',
    price: 24.0,
    compareAtPrice: 32.0,
    description: 'pH-balanced colloidal oatmeal, organic aloe vera, and sweet almond oil wash that calms sensitive itchy skin, eliminates pet odor, and leaves fur silky without harsh sulfates.',
    rating: 4.9,
    reviewsCount: 88,
    inStock: true,
    stockCount: 27,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    features: [
      'Colloidal oatmeal for instant anti-itch relief',
      'Paraben, dye, sulfate & cruelty-free formula',
      'Natural light lavender & chamomile calming fragrance',
      'Safe for puppies and kittens over 6 weeks'
    ],
    tags: ['Sensitive Skin', 'Hypoallergenic', 'Organic'],
    isBundleEligible: true,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'LZG-8492',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    customer: {
      name: 'Sarah Jenkins',
      email: 'ricopack0117@gmail.coma',
      phone: '+1 (555) 234-8921',
      address: '742 Evergreen Terrace',
      city: 'Seattle',
      country: 'United States',
      postalCode: '98101',
      notes: 'Please leave at the front porch near the gate.',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedVariant: 'Large (Charcoal)',
      },
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
      },
    ],
    freeGifts: [DEFAULT_FREE_GIFT],
    subtotal: 112.0,
    compareAtSubtotal: 153.0,
    discount: 0,
    shipping: 0, // Free Delivery
    total: 112.0,
    paymentMethod: 'DPO_CARD',
    paymentStatus: 'paid',
    dpoReference: 'DPO-8492019-SEC',
    dpoTransactionId: 'TRX-9982314-DPO',
    orderStatus: 'shipped',
    trackingNumber: 'LP-TRK-771928340',
    carrier: 'DHL PetExpress Ground',
    estimatedDelivery: 'Tomorrow, 2:00 PM - 5:00 PM',
    statusHistory: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        note: 'Order submitted securely via LzgPaw storefront.',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 35.8 * 3600 * 1000).toISOString(),
        note: 'Payment verified and authenticated securely through DPO Pay gateway.',
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        note: 'Carefully packaged at LzgPaw Central Fulfillment Center with complimentary order perk included.',
        location: 'LzgPaw Hub - North Warehouse',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        note: 'Handed over to carrier. In transit to destination distribution hub.',
        location: 'In Transit · Regional Sort Facility',
      },
    ],
  },
  {
    id: 'LZG-9281',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    customer: {
      name: 'Michael Chang',
      email: 'michael.chang@example.com',
      phone: '+1 (555) 782-9012',
      address: '128 Ocean Avenue, Apt 4B',
      city: 'San Francisco',
      country: 'United States',
      postalCode: '94107',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
      },
    ],
    freeGifts: [DEFAULT_FREE_GIFT],
    subtotal: 62.0,
    compareAtSubtotal: 86.0,
    discount: 0,
    shipping: 0,
    total: 62.0,
    paymentMethod: 'DPO_MOBILE_MONEY',
    paymentStatus: 'paid',
    dpoReference: 'DPO-9281541-MOM',
    dpoTransactionId: 'TRX-4419208-DPO',
    orderStatus: 'processing',
    trackingNumber: 'LP-TRK-882910394',
    carrier: 'FedEx Pet Priority',
    estimatedDelivery: 'In 2 Business Days',
    statusHistory: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        note: 'Order submitted securely.',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 3.9 * 3600 * 1000).toISOString(),
        note: 'Payment captured via DPO Pay Mobile Money gateway.',
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        note: 'Order being packed and tagged for dispatch with complimentary bonus included.',
        location: 'LzgPaw Fulfillment Bay 3',
      },
    ],
  },
];

export const FAQ_ITEMS = [
  {
    q: 'How does your "Free Delivery on Every Order" work?',
    a: 'At LzgPaw, every single order ships 100% free of charge! There are no minimum order values, no hidden fuel surcharges, and no surprise checkout fees. We partner with reliable carriers to deliver your pet goods directly to your door with real-time GPS tracking.',
  },
  {
    q: 'How does the Buy 2 Multi-Item offer work?',
    a: 'It is seamless and automatic! When you add any 2 or more products from our catalog to your cart, our system immediately activates bundle savings and includes a complimentary pet care bonus pack into your order for $0.00. No promo codes needed.',
  },
  {
    q: 'What is DPO Pay and how secure is my payment?',
    a: 'DPO Pay (Direct Pay Online) is an international PCI-DSS Level 1 certified payment gateway. We utilize encrypted, tokenized checkout protocols that protect customer financial details without storing raw card numbers or wallet PINs. DPO Pay supports major Credit/Debit Cards (Visa, Mastercard, American Express), Mobile Money (M-Pesa, Airtel Money, MTN MoMo), and instant Direct Bank Transfers.',
  },
  {
    q: 'How can I track my package once dispatched?',
    a: 'Head over to our Track Order page and enter your Order ID (for example, LZG-8492) or the email address used at checkout. You will see a live step-by-step progress timeline, carrier status, dispatch facility, and estimated delivery window.',
  },
  {
    q: 'How do Push Notifications work for order status updates?',
    a: 'When enabled, our push notification system pings your device as soon as your order is confirmed, packed, shipped, out for delivery, and delivered. You can opt in right after checkout or on the order tracking page.',
  },
  {
    q: 'What is your return & happiness guarantee policy?',
    a: 'We offer a 30-Day Happiness Guarantee. If your furry companion does not completely fall in love with any LzgPaw product, simply contact our team at ricopack0117@gmail.com or via Instagram @lzgpaw for a hassle-free exchange or full refund.',
  },
  {
    q: 'Are your pet products veterinarian vetted and non-toxic?',
    a: 'Yes. Every material we source—from food-grade 304 stainless steel in our water fountains to natural vegetable-tanned leather and organic soothing balms—is independently tested, 100% pet-safe, and free from toxic phthalates, parabens, or heavy metals.',
  },
];
