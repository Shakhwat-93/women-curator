import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyMobileOrderBar } from './components/layout/StickyMobileOrderBar';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Hero } from './components/sections/Hero';
import { ProductGrid } from './components/sections/ProductGrid';
import { EditorialSpread } from './components/sections/EditorialSpread';
import { Benefits } from './components/sections/Benefits';
import { Testimonials } from './components/sections/Testimonials';
import { DirectOrderSection } from './components/sections/DirectOrderSection';
import { ProductModal } from './components/product/ProductModal';
import {
  Product,
  HeroSlide,
  HomepageSection,
  Testimonial,
  AnnouncementBar as AnnouncementBarType,
  NavigationItem,
  SiteSettings,
  DeliverySettings
} from './types';
import {
  productService,
  heroService,
  homepageService,
  testimonialService,
  marketingService,
  navigationService,
  settingsService
} from './lib/api';
import { SEED_PRODUCTS } from './data/seedData';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product>(SEED_PRODUCTS[0]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Dynamic CMS Data States
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [announcement, setAnnouncement] = useState<AnnouncementBarType | null>(null);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);

  useEffect(() => {
    async function loadAllCmsData() {
      try {
        setIsLoadingProducts(true);
        const [
          prods,
          secs,
          slides,
          tests,
          ann,
          navs,
          sites,
          deliv
        ] = await Promise.all([
          productService.getProducts(),
          homepageService.getSections(),
          heroService.getSlides(),
          testimonialService.getTestimonials(),
          marketingService.getAnnouncement(),
          navigationService.getNavigation(),
          settingsService.getSiteSettings(),
          settingsService.getDeliverySettings()
        ]);

        if (prods && prods.length > 0) {
          const published = prods.filter(p => p.status !== 'archived');
          setProducts(published.length > 0 ? published : prods);
          setSelectedProduct(published[0] || prods[0]);
        }
        setSections(secs);
        setHeroSlides(slides);
        setTestimonials(tests);
        setAnnouncement(ann);
        setNavItems(navs);
        setSiteSettings(sites);
        setDeliverySettings(deliv);
      } catch (e) {
        console.warn('Using fallback seed data', e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadAllCmsData();
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

  // Section Render Helper driven by Homepage Section CMS
  const renderSection = (section: HomepageSection) => {
    if (!section.is_enabled) return null;

    switch (section.section_key) {
      case 'hero':
        return (
          <Hero
            key={section.id}
            slides={heroSlides}
            onShopCollection={scrollToProducts}
            onDirectOrder={() => scrollToOrderForm()}
          />
        );

      case 'products':
        return (
          <ProductGrid
            key={section.id}
            products={products}
            isLoading={isLoadingProducts}
            onQuickView={handleOpenQuickView}
            onDirectOrder={(product) => scrollToOrderForm(product)}
          />
        );

      case 'direct_order':
        return (
          <DirectOrderSection
            key={section.id}
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            deliverySettings={deliverySettings}
          />
        );

      case 'editorial':
        return (
          <EditorialSpread
            key={section.id}
            onExplore={() => scrollToOrderForm()}
          />
        );

      case 'benefits':
        return <Benefits key={section.id} />;

      case 'testimonials':
        return (
          <div key={section.id} id="reviews">
            <Testimonials testimonials={testimonials} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF5EE] text-curator-charcoal selection:bg-curator-coral/20 selection:text-curator-coral overflow-x-hidden">
      {/* 1. Top Dynamic Announcement Bar */}
      <AnnouncementBar data={announcement} />

      {/* 2. Single Landing Page Dynamic Navbar */}
      <Navbar
        onOrderNow={() => scrollToOrderForm()}
        navigationItems={navItems}
        siteSettings={siteSettings}
      />

      {/* 3. Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      {/* 4. Sticky Bottom Mobile Order Bar */}
      <StickyMobileOrderBar
        currentProduct={selectedProduct}
        onOrderClick={() => scrollToOrderForm()}
      />

      {/* ─── DYNAMIC CMS-DRIVEN STOREFRONT SECTIONS ─── */}
      <main>
        {sections && sections.length > 0 ? (
          sections.map(sec => renderSection(sec))
        ) : (
          <>
            <Hero
              slides={heroSlides}
              onShopCollection={scrollToProducts}
              onDirectOrder={() => scrollToOrderForm()}
            />
            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              onQuickView={handleOpenQuickView}
              onDirectOrder={(product) => scrollToOrderForm(product)}
            />
            <DirectOrderSection
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              deliverySettings={deliverySettings}
            />
            <EditorialSpread onExplore={() => scrollToOrderForm()} />
            <Benefits />
            <div id="reviews">
              <Testimonials testimonials={testimonials} />
            </div>
          </>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
};
