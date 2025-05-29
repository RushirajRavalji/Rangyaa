export interface NavigationItem {
  label: string;
  href: string;
  dropdown?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    label: 'MEN',
    href: '/men',
    dropdown: [
      { label: 'Jeans', href: '/men/jeans' },
      { label: 'Shirts', href: '/men/shirts' },
      { label: 'T-Shirts', href: '/men/t-shirts' }
    ]
  },
  {
    label: 'NEW ARRIVALS',
    href: '/new-arrivals',
  },
  {
    label: 'SALE',
    href: '/sale',
  }
];

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Stores', href: '/stores' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' }
  ],
  categories: [
    { label: 'Men\'s Jeans', href: '/men/jeans' },
    { label: 'Women\'s Jeans', href: '/women/jeans' },
    { label: 'Shirts', href: '/men/shirts' },
    { label: 'Accessories', href: '/accessories' },
    { label: 'Sale', href: '/sale' }
  ],
  customerService: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Gift Cards', href: '/gift-cards' }
  ]
}; 