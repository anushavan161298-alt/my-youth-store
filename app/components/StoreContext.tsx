'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../../lib/server-store';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  product: Product;
}

interface StoreContextType {
  cart: CartItem[];
  favorites: Product[];
  isHydrated: boolean;
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateCartItem: (productId: string, oldSize: string | undefined, oldColor: string | undefined, updatedFields: Partial<CartItem>) => void;
  clearCart: () => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('youth-store-cart');
    const savedFavs = localStorage.getItem('youth-store-favs');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Фильтруем битые данные, где нет объекта product
          setCart(parsed.filter((item: any) => item && item.product));
        }
      } catch (e) {}
    }
    if (savedFavs) {
      try {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) setFavorites(parsed.filter(Boolean));
      } catch (e) {}
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('youth-store-cart', JSON.stringify(cart));
      localStorage.setItem('youth-store-favs', JSON.stringify(favorites));
    }
  }, [cart, favorites, isHydrated]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart(prevCart => {
      // Ищем существующий товар с таким же ID, размером и цветом
      const existingItem = prevCart.find(item => 
        item.productId === product.id && item.size === size && item.color === color
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            price: product.discountPrice || product.sellingPrice,
            quantity: 1,
            size,
            color,
            product: product, // Сохраняем полный объект продукта
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.productId === productId && item.size === size && item.color === color)
    ));
  };

  const updateCartItem = (productId: string, oldSize: string | undefined, oldColor: string | undefined, updatedFields: Partial<CartItem>) => {
    setCart(prev => prev.map(item => 
      (item.productId === productId && item.size === oldSize && item.color === oldColor)
        ? { ...item, ...updatedFields }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isFavorite = (id: string) => favorites.some(p => p.id === id);

  return (
    <StoreContext.Provider value={{ 
      cart, 
      favorites, 
      isHydrated,
      addToCart, 
      removeFromCart, 
      updateCartItem,
      clearCart,
      toggleFavorite, 
      isFavorite,
    }}>
      {children}
    </StoreContext.Provider>
  );
};