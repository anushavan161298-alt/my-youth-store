'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from './ProductCard'; // Исправлен путь импорта
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Product } from '../lib/server-store';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]); // State to hold products
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [sortOrder, setSortOrder] = useState<string>('default');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || ''; // Получаем searchQuery из URL

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try to load from local storage first (cache)
        const savedProducts = localStorage.getItem('youth-store-products');
        if (savedProducts) {
          try {
            setProducts(Object.values(JSON.parse(savedProducts)));
            setIsHydrated(true);
          } catch (e) {
            console.error("Failed to parse products from localStorage", e);
            localStorage.removeItem('youth-store-products'); // Clear corrupted data
          }
        }

        // If not in local storage or corrupted, fetch from API
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(Object.values(data));
        } else {
          console.error('Failed to fetch products:', response.statusText);
          setProducts([]); // Устанавливаем пустой массив в случае ошибки
        }
      } catch (error) {
        console.error('Network error fetching products:', error);
        setProducts([]); // Устанавливаем пустой массив в случае ошибки сети
      }
      setIsHydrated(true);
    };

    fetchProducts();
  }, []);

  // Save products to local storage whenever they change (for caching)
  useEffect(() => {
    if (isHydrated && products.length > 0) {
      localStorage.setItem('youth-store-products', JSON.stringify(products));
    }
  }, [products, isHydrated]);

  const categories = useMemo(() => ['Все', ...Array.from(new Set(products.map(p => p.category || 'Другое')))].sort(), [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesCategory = selectedCategory === 'Все' || (p.category || 'Другое').toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.article && p.article.toLowerCase().includes(searchQuery.toLowerCase())); // Check if article exists
    return matchesCategory && matchesSearch;
  }), [products, selectedCategory, searchQuery]);

  const sortedProducts = useMemo(() => [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.sellingPrice;
    const priceB = b.discountPrice || b.sellingPrice;
    if (sortOrder === 'lowToHigh') return priceA - priceB;
    if (sortOrder === 'highToLow') return priceB - priceA;
    return 0;
  }), [filteredProducts, sortOrder]);

  if (!isHydrated) return <main className="p-8 min-h-screen" />;

  return (
    <main className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Сортировка - теперь отдельно от поиска */}
        <div className="flex justify-end mb-8">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ArrowUpDown className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-12 pr-10 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm text-gray-900 appearance-none cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="default">По умолчанию</option>
              <option value="lowToHigh">Сначала дешевле</option>
              <option value="highToLow">Сначала дороже</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {sortedProducts.length > 0 ? (
            sortedProducts.map(product => (
              // ProductCard теперь сам обрабатывает логику перехода или добавления в корзину
              <ProductCard key={product.id} product={{ ...product, images: product.images || [] }} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-400">
              Товары не найдены
            </div>
          )}
        </div>
      </div>
    </main>
  );
}