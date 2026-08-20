import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyMobileOrderBar } from './components/layout/StickyMobileOrderBar';
import { Hero } from './components/sections/Hero';
import { ProductGrid } from './components/sections/ProductGrid';
import { EditorialSpread } from './components/sections/EditorialSpread';
import { Benefits } from './components/sections/Benefits';
import { Testimonials } from './components/sections/Testimonials';
import { DirectOrderSection } from './components/sections/DirectOrderSection';
import { ProductModal } from './components/product/ProductModal';
import { Product } from './types';
import { productService } from './lib/api';
import { SEED_PRODUCTS } from './data/seedData';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product>(SEED_PRODUCTS[0]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingProducts(true);
        const data = await productService.getFeaturedProducts();
        if (data && data.length > 0) {
          setProducts(data);
          setSelectedProduct(data[0]);
        }
      } catch (e) {
        console.warn('Using local seed data', e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadData();
  }, []);

  const scrollToOrderForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    }
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF5EE] text-curator-charcoal selection:bg-curator-coral/20 selection:text-curator-coral overflow-x-hidden">
      {/* 1. Single Landing Page Minimal Navbar with Order CTA */}
      <Navbar onOrderNow={() => scrollToOrderForm()} />

      {/* 2. Quick View Modal for Deep-Dive Inspection */}
      <ProductModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      {/* 3. Sticky Bottom Mobile Order Bar */}
      <StickyMobileOrderBar
        currentProduct={selectedProduct}
        onOrderClick={() => scrollToOrderForm()}
      />

      {/* ─── SINGLE LANDING PAGE DIRECT SALES FUNNEL ─── */}
      <main>
        {/* SECTION 1: Exact 3-Model Hero Campaign Banner */}
        <Hero
          onShopCollection={scrollToProducts}
          onDirectOrder={() => scrollToOrderForm()}
        />

        {/* SECTION 2: 4 Featured Products Grid (Reference Card UI) */}
        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          onQuickView={handleOpenQuickView}
          onDirectOrder={(product) => scrollToOrderForm(product)}
        />

        {/* SECTION 3: IN-PAGE DIRECT ORDER FORM (Direct Checkout Section) */}
        <DirectOrderSection
          products={products}
          selectedProduct={selectedProduct}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />

        {/* SECTION 4: Brand Mission & Story Spread */}
        <EditorialSpread onExplore={() => scrollToOrderForm()} />

        {/* SECTION 5: Why Women Curator — Luxury Craft & Guarantee */}
        <Benefits />

        {/* SECTION 6: Voices of the Muse — Customer Reviews */}
        <div id="reviews">
          <Testimonials />
        </div>
      </main>

      {/* ─── EDITORIAL FOOTER ─── */}
      <Footer />
    </div>
  );
};
