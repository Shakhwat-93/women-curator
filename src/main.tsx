import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminToastProvider } from './admin/context/AdminToastContext';

// Admin Shell & Pages
import { AdminProtectedRoute } from './admin/components/AdminProtectedRoute';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { ProductsPage } from './admin/pages/ProductsPage';
import { ProductEditorPage } from './admin/pages/ProductEditorPage';
import { OrdersPage } from './admin/pages/OrdersPage';
import { CategoriesPage } from './admin/pages/CategoriesPage';
import { CollectionsPage } from './admin/pages/CollectionsPage';
import { HomepageSectionsPage } from './admin/pages/HomepageSectionsPage';
import { HeroSlidesPage } from './admin/pages/HeroSlidesPage';
import { TestimonialsPage } from './admin/pages/TestimonialsPage';
import { NavigationPage } from './admin/pages/NavigationPage';
import { AnnouncementPage } from './admin/pages/AnnouncementPage';
import { NewsletterPage } from './admin/pages/NewsletterPage';
import { StoreSettingsPage } from './admin/pages/StoreSettingsPage';
import { DeliverySettingsPage } from './admin/pages/DeliverySettingsPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { MediaPage } from './admin/pages/MediaPage';
import { TrackingSettingsPage } from './admin/pages/TrackingSettingsPage';
import { CourierSettingsPage } from './admin/pages/CourierSettingsPage';
import { SystemHealthPage } from './admin/pages/SystemHealthPage';
import { RouteTracker } from './tracking/RouteTracker';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteTracker />
      <AdminAuthProvider>
        <AdminToastProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* 1. Public Storefront Landing Page */}
                <Route path="/" element={<App />} />

                {/* 2. Admin Authentication */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* 3. Protected Admin Panel & CMS */}
                <Route path="/admin" element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/new" element={<ProductEditorPage />} />
                    <Route path="products/:id" element={<ProductEditorPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="collections" element={<CollectionsPage />} />
                    <Route path="content/homepage" element={<HomepageSectionsPage />} />
                    <Route path="content/hero" element={<HeroSlidesPage />} />
                    <Route path="content/testimonials" element={<TestimonialsPage />} />
                    <Route path="content/navigation" element={<NavigationPage />} />
                    <Route path="marketing/announcement" element={<AnnouncementPage />} />
                    <Route path="marketing/newsletter" element={<NewsletterPage />} />
                    <Route path="settings/tracking" element={<TrackingSettingsPage />} />
                    <Route path="settings/courier" element={<CourierSettingsPage />} />
                    <Route path="settings/health" element={<SystemHealthPage />} />
                    <Route path="settings/store" element={<StoreSettingsPage />} />
                    <Route path="settings/delivery" element={<DeliverySettingsPage />} />
                    <Route path="settings/admins" element={<AdminUsersPage />} />
                    <Route path="media" element={<MediaPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AdminToastProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
