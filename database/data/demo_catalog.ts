export const demoProducts = [
  {
    category: 'Electronics',
    categorySlug: 'electronics',
    name: 'Compact mechanical keyboard',
    slug: 'compact-mechanical-keyboard',
    description:
      'A compact keyboard for work and play. Choose the switch feel that suits your desk.\nDemo product; illustrations are examples.',
    options: [{ name: 'Switch', values: ['Tactile', 'Linear'] }],
    variants: [
      { sku: 'KEY-COMPACT-T', vnd: '1250000', other: '49', selections: ['Tactile'] },
      { sku: 'KEY-COMPACT-L', vnd: '1200000', other: '47', selections: ['Linear'] },
    ],
    images: ['keyboard.svg', 'keyboard-detail.svg'],
  },
  {
    category: 'Coffee & pantry',
    categorySlug: 'coffee-pantry',
    name: 'Đà Lạt coffee beans',
    slug: 'da-lat-coffee-beans',
    description:
      'Cà phê rang tại Đà Lạt. Chọn khối lượng và kiểu xay phù hợp với cách pha của bạn.',
    options: [
      { name: 'Weight', values: ['250 g', '500 g'] },
      { name: 'Grind', values: ['Whole bean', 'Filter'] },
    ],
    variants: [
      { sku: 'COFFEE-250-W', vnd: '145000', other: '6', selections: ['250 g', 'Whole bean'] },
      { sku: 'COFFEE-250-F', vnd: '145000', other: '6', selections: ['250 g', 'Filter'] },
      { sku: 'COFFEE-500-W', vnd: '275000', other: '11', selections: ['500 g', 'Whole bean'] },
      { sku: 'COFFEE-500-F', vnd: '275000', other: '11', selections: ['500 g', 'Filter'] },
    ],
    images: ['coffee.svg', 'coffee-detail.svg'],
  },
  {
    category: 'Stationery',
    categorySlug: 'stationery',
    name: 'Everyday dotted notebook',
    slug: 'everyday-dotted-notebook',
    description: 'An A5 dotted notebook for planning, sketches and everyday notes.',
    options: [],
    variants: [{ sku: 'NOTE-A5-DOT', vnd: '89000', other: '4', selections: [] }],
    images: ['notebook.svg'],
  },
  {
    category: 'Books & hobbies',
    categorySlug: 'books-hobbies',
    name: 'Weekend model kit',
    slug: 'weekend-model-kit',
    description:
      'A small wooden model kit for a quiet weekend project. No fashion-specific product fields required.',
    options: [],
    variants: [{ sku: 'MODEL-WEEKEND', vnd: '320000', other: '13', selections: [] }],
    images: ['model-kit.svg'],
  },
]
