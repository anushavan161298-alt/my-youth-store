'use client';

import React from 'react';
import { useStore } from '../components/StoreContext';
import ProductCard from '../ProductCard'; // Исправлен путь импорта
import { Heart } from 'lucide-react'; // Путь верный
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, isHydrated } = useStore();

  if (!isHydrated) return <div className="p-8 text-center min-h-screen flex items-center justify-center">Загрузка...</div>;

  if (favorites.length === 0) {
    return (
      <main className="p-8 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-red-50 rounded-full mb-6">
          <Heart className="w-12 h-12 text-red-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Список желаний пуст</h1>
        <p className="text-gray-500 mb-8">Добавляйте товары в избранное, чтобы не потерять их!</p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all">
          В магазин
        </Link>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Избранное</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {favorites.map(product => (
            <ProductCard key={product.id} product={{ ...product, images: product.images || [] }} />
          ))}
        </div>
      </div>
    </main>
  );
}