# Sebastian Stores - Luxury E-commerce Frontend

> [!IMPORTANT]
> **Development Workflow:**
> - All development must be done in the `dev` branch.
> - When opening a Pull Request, set the **base branch** to `preview` and compare it against `dev`.

A premium, high-performance luxury e-commerce frontend built with React, Vite, and Tailwind CSS. This application features a stunning design and a seamless shopping experience.

## ✨ Features

- **Premium Design Aesthetics**: Clean, luxury-focused UI with glassmorphism, smooth animations, and a curated color palette.
- **Dynamic Product Gallery**: High-quality product images with interactive galleries.
- **Cart & Wishlist**: Real-time state management for shopping cart and product wishlist using Zustand.
- **Smart Search**: Persistent search overlay with trending suggestions and keyboard shortcuts (Ctrl+K).
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop devices.
- **Form Validation**: Advanced client-side validation using React Hook Form and Yup.
- **Toasts Notifications**: Real-time feedback for user actions using Sonner.

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **State Management**: Zustand (with Persistence)
- **Routing**: React Router
- **Forms**: React Hook Form & Yup
- **UI Components**: shadcn/ui & Lucide React
- **Animations**: Tailwind CSS Animate & Framer Motion (if applicable)

## 📁 Folder Structure

```text
public/                 # Static assets served from the root
├── favicon.jpg         # Website favicon
├── robots.txt          # SEO robots file
└── placeholder.svg     # Default image placeholders
src/
├── assets/             # Static assets (logos, images, fonts)
├── components/         # Reusable UI components
│   ├── ui/             # shadcn-ui base components
│   ├── Header.tsx      # Main navigation with mega menu
│   ├── Footer.tsx      # Multi-column footer
│   └── ...             # Feature-specific components (ProductCard, SearchOverlay, etc.)
├── data/               # Static data and mock products
│   └── products.ts     # Product definitions and categories
├── lib/                # Shared utilities and configurations
│   ├── utils.ts        # Tailwind merge helper
├── pages/              # Main route components
│   ├── Home.tsx        # Landing page with hero and sections
│   ├── Shop.tsx        # Product listing with filters
│   ├── Checkout.tsx    # Multi-step validated checkout form
│   ├── auth/           # Authentication pages (SignIn, SignUp)
│   └── ...             # Other pages (Cart, Wishlist, Account, etc.)
├── store/              # Zustand stores for global state
│   ├── useCartStore.ts     # Cart management
│   ├── useWishlistStore.ts # Wishlist management
│   ├── useSettingsStore.ts # Currency settings
│   └── useAuthStore.ts     # User authentication state
├── App.tsx             # Main app entry and providers
├── main.tsx            # Entry point
└── routes.tsx          # Route definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd iqra-mark-ecommerce
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

## 📝 Key Implementation Details

- **State Persistence**: The cart, wishlist, and user settings are persisted in `localStorage` automatically using Zustand middleware.
- **Validation**: Checkout forms use custom regex for strict input validation (Names: only letters/spaces, Phone/Postal: only digits).

## 📄 License

Internal Project - All Rights Reserved.
