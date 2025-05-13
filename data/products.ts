export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  featured?: boolean;
  description: string;
  stock: number;
  sizes: string[];
  colors?: { name: string; code: string }[];
  tags?: string[];
  new?: boolean;
  discount?: number;
  rating?: number;
  reviews?: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Slim Fit Jeans",
    price: 5999,
    originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "jeans",
    featured: true,
    description: "Our premium slim fit jeans are designed for comfort and style. Made from high-quality denim with just the right amount of stretch for all-day comfort.",
    stock: 15,
    sizes: ["30", "32", "34", "36", "38"],
    colors: [
      { name: "Dark Blue", code: "#0a2472" },
      { name: "Black", code: "#000000" }
    ],
    tags: ["slim fit", "denim", "premium"],
    discount: 25,
    rating: 4.7,
    reviews: 42
  },
  {
    id: "p2",
    name: "Classic Oxford Shirt",
    price: 3999,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "shirts",
    featured: true,
    description: "A timeless classic that belongs in every wardrobe. This oxford shirt is crafted from soft, premium cotton with a comfortable regular fit and versatile styling options.",
    stock: 25,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", code: "#ffffff" },
      { name: "Light Blue", code: "#a8d0e6" },
      { name: "Pink", code: "#f8c8dc" }
    ],
    tags: ["oxford", "formal", "cotton"],
    discount: 20,
    rating: 4.5,
    reviews: 28
  },
  {
    id: "p3",
    name: "Relaxed Fit Denim",
    price: 6999,
    originalPrice: 8499,
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "jeans",
    featured: true,
    description: "Designed with comfort in mind, our relaxed fit denim offers a looser fit through the seat and thigh for ultimate comfort without compromising on style.",
    stock: 12,
    sizes: ["30", "32", "34", "36", "38", "40"],
    colors: [
      { name: "Medium Blue", code: "#5c7aea" },
      { name: "Light Wash", code: "#b8c0ff" }
    ],
    tags: ["relaxed fit", "denim", "comfort"],
    discount: 18,
    rating: 4.8,
    reviews: 36
  },
  {
    id: "p4",
    name: "Premium Formal Shirt",
    price: 4499,
    originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "shirts",
    featured: true,
    description: "Elevate your formal wardrobe with this premium shirt. Featuring a tailored fit, breathable fabric, and elegant design details for a sophisticated look.",
    stock: 18,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", code: "#ffffff" },
      { name: "Black", code: "#000000" },
      { name: "Navy", code: "#051937" }
    ],
    tags: ["formal", "premium", "tailored"],
    discount: 25,
    rating: 4.6,
    reviews: 22
  },
  {
    id: "p5",
    name: "Stretch Denim Skinny Jeans",
    price: 4999,
    image: "https://images.unsplash.com/photo-1604176424472-9ce191efcf59?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "jeans",
    description: "Our skinny jeans feature a contemporary slim fit with added stretch for maximum comfort and movement. Perfect for a modern, streamlined silhouette.",
    stock: 22,
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Black", code: "#000000" },
      { name: "Dark Blue", code: "#0a2472" }
    ],
    tags: ["skinny", "stretch", "denim"],
    new: true,
    rating: 4.3,
    reviews: 15
  },
  {
    id: "p6",
    name: "Linen Summer Shirt",
    price: 3499,
    originalPrice: 4299,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "shirts",
    description: "Made from 100% premium linen, this breathable summer shirt keeps you cool and comfortable even on the hottest days. Features a relaxed fit and classic styling.",
    stock: 30,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Beige", code: "#f5f5dc" },
      { name: "Light Blue", code: "#a8d0e6" },
      { name: "White", code: "#ffffff" }
    ],
    tags: ["linen", "summer", "casual"],
    discount: 18,
    rating: 4.5,
    reviews: 19
  },
  {
    id: "p7",
    name: "Distressed Denim Jacket",
    price: 7999,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "outerwear",
    description: "This vintage-inspired denim jacket features distressed details for an authentic worn-in look. Perfect for layering in any season.",
    stock: 10,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blue", code: "#1e3d59" },
      { name: "Light Wash", code: "#b8c0ff" }
    ],
    tags: ["jacket", "denim", "distressed"],
    new: true,
    rating: 4.9,
    reviews: 12
  },
  {
    id: "p8",
    name: "Casual Checkered Shirt",
    price: 2999,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=600&q=80",
    category: "shirts",
    description: "This versatile checkered shirt is perfect for casual occasions. Made from soft cotton with a comfortable regular fit.",
    stock: 28,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Red/Black", code: "#7c0a02" },
      { name: "Blue/White", code: "#5c7aea" }
    ],
    tags: ["checkered", "casual", "cotton"],
    discount: 14,
    rating: 4.4,
    reviews: 31
  }
]; 