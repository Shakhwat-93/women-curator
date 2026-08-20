import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ColorOption } from '../types';
import { track } from '../tracking';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: ColorOption, size?: string) => void;
  removeFromCart: (productId: string, colorHex: string, size: string) => void;
  updateQuantity: (productId: string, colorHex: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { valid: boolean; message: string };
  removePromoCode: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckoutWithItem?: (product: Product, color?: ColorOption, size?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'women_curator_cart_items';
const PROMO_STORAGE_KEY = 'women_curator_promo';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem(CART_STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>(() => {
    return localStorage.getItem(PROMO_STORAGE_KEY) || '';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    if (promoCode) {
      localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [promoCode]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    color?: ColorOption,
    size?: string
  ) => {
    const selectedColor = color || product.colors[0];
    const selectedSize = size || product.sizes?.[0] || 'M (38)';

    track.addToCart(product, quantity, selectedColor.name, selectedSize);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColor.hex === selectedColor.hex &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor, selectedSize }];
      }
    });

    setIsCartOpen(true);
  };

  const openCheckoutWithItem = (
    product: Product,
    color?: ColorOption,
    size?: string
  ) => {
    const selectedColor = color || product.colors[0];
    const selectedSize = size || product.sizes?.[0] || 'M (38)';

    track.addToCart(product, 1, selectedColor.name, selectedSize);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColor.hex === selectedColor.hex &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        return prevCart;
      } else {
        return [...prevCart, { product, quantity: 1, selectedColor, selectedSize }];
      }
    });

    setIsCheckoutOpen(true);
  };

  const removeFromCart = (productId: string, colorHex: string, size: string) => {
    const target = cart.find(
      it =>
        it.product.id === productId &&
        it.selectedColor.hex === colorHex &&
        it.selectedSize === size
    );
    if (target) {
      track.removeFromCart(target.product, target.quantity, target.selectedColor.name, target.selectedSize);
    }

    setCart(prevCart =>
      prevCart.filter(
        item =>
          !(
            item.product.id === productId &&
            item.selectedColor.hex === colorHex &&
            item.selectedSize === size
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    colorHex: string,
    size: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, colorHex, size);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (
          item.product.id === productId &&
          item.selectedColor.hex === colorHex &&
          item.selectedSize === size
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (promoCode.toUpperCase() === 'CURATOR10' || promoCode.toUpperCase() === 'VIBE10') {
    discount = Math.round(subtotal * 0.10);
  } else if (promoCode.toUpperCase() === 'FIRSTDROP' || promoCode.toUpperCase() === 'WOMEN200') {
    discount = subtotal > 1500 ? 200 : 0;
  }

  // Delivery charge (flat 80 Inside Dhaka default, calculate live in checkout)
  const deliveryCharge = totalItems > 0 ? 80 : 0;

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'CURATOR10' || clean === 'VIBE10') {
      setPromoCode(clean);
      return { valid: true, message: '10% Exclusive discount applied!' };
    } else if (clean === 'FIRSTDROP' || clean === 'WOMEN200') {
      setPromoCode(clean);
      return { valid: true, message: '৳200 Special Drop voucher applied!' };
    } else {
      return { valid: false, message: 'Invalid promo code. Try CURATOR10 or VIBE10' };
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryCharge,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckoutWithItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
