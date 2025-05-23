# Nikhil's Jeans - Next.js E-commerce Website

A modern, responsive e-commerce website built with Next.js and React. This project is a conversion of a static HTML/CSS website into a dynamic, component-based application.

## Features

- Modern React components with TypeScript
- Next.js for server-side rendering and static site generation
- Responsive design for mobile and desktop
- Dynamic product pages with server-side rendering
- Shopping cart functionality with state management
- CSS Modules for component-scoped styling
- Mobile-first responsive design

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd jeans-nextjs
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the website.

## Project Structure

- `/components` - Reusable React components
  - `Header.tsx` - Navigation header with mobile menu
  - `Footer.tsx` - Site footer with multiple columns
  - `Hero.tsx` - Hero banner component
  - `Layout.tsx` - Layout wrapper for consistent page structure
  - `ProductCard.tsx` - Card component for displaying products
- `/data` - Static data files
  - `products.ts` - Product data with TypeScript interfaces
  - `navigation.ts` - Navigation menu structure
- `/pages` - Next.js pages and routing
  - `index.tsx` - Homepage with hero and featured products
  - `cart.tsx` - Shopping cart page
  - `products.tsx` - Products listing page with filters
  - `product/[id].tsx` - Dynamic product detail page
  - `_app.tsx` - Custom App component with global styles
- `/public` - Static assets (images, icons, etc.)
- `/styles` - CSS modules and global styles
  - `globals.css` - Global styles and CSS variables
  - `*.module.css` - Component-specific styles

## CSS Approach

This project uses CSS Modules to scope styles to specific components, preventing style leakage and naming conflicts. Key styling features include:

- CSS variables for consistent theming (colors, spacing, typography)
- Mobile-first media queries
- Flexbox and Grid layouts
- Responsive design patterns
- Component-scoped animations and transitions

Example of a module file structure:
```css
/* Component styling */
.componentName {
  /* styles */
}

/* Variants */
.active {
  /* styles */
}

/* Media queries */
@media (max-width: 768px) {
  .componentName {
    /* mobile styles */
  }
}
```

## Features to Implement

Some ideas for enhancing the e-commerce functionality:

- User authentication with NextAuth.js
- Shopping cart persistence with local storage
- Integration with a payment gateway
- Admin dashboard for managing products
- Backend API with product database
- Search functionality
- User reviews and ratings

## Deployment

This Next.js app can be deployed to various platforms:

- Vercel (recommended for Next.js apps)
- Netlify
- AWS Amplify
- Traditional hosting with `npm run build` and `npm start`

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [CSS Modules](https://github.com/css-modules/css-modules) #   r a n g y a  
 #   R a n g y a a  
 