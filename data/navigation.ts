export interface DropdownItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Men",
    href: "/men",
    dropdown: [
      { label: "Jeans", href: "/men/jeans" },
      { label: "Shirts", href: "/men/shirts" },
      { label: "T-Shirts", href: "/men/t-shirts" },
      { label: "Sweaters", href: "/men/sweaters" },
      { label: "Jackets", href: "/men/jackets" }
    ]
  },
  {
    label: "Women",
    href: "/women",
    dropdown: [
      { label: "Dresses", href: "/women/dresses" },
      { label: "Tops", href: "/women/tops" },
      { label: "Jeans", href: "/women/jeans" },
      { label: "Skirts", href: "/women/skirts" },
      { label: "Accessories", href: "/women/accessories" }
    ]
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals"
  },
  {
    label: "Sale",
    href: "/sale"
  }
]; 