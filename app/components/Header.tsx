'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from './StoreContext';
import { Heart, ShoppingCart, User, ChevronDown, Package, MapPin, LogOut, Search } from 'lucide-react';
import { useUser } from './UserContext'; // Путь верный
import { useRouter } from 'next/navigation';

export default function Header() {
  const { cart, favorites, isHydrated } = useStore();
  const { user, isHydrated: userHydrated, logout } = useUser(); // Получаем данные пользователя и функцию logout
  const [searchInputValue, setSearchInputValue] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      router.push(`/?search=${encodeURIComponent(searchInputValue.trim())}`);
    } else {
      router.push('/'); // Go to home page if search is empty
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          YOUTH STORE
        </Link>

        {/* Поиск товаров - как на Wildberries: по центру, широкий и с фоном */}
        <form onSubmit={handleSearch} className="flex-grow flex justify-center mx-8">
          <div className="relative flex items-center w-full max-w-2xl"> {/* max-w-2xl для большей ширины */}
            <input
              type="text"
              placeholder="Искать товары..."
              className="pl-12 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 w-full text-base shadow-sm" // py-2.5 для увеличения высоты
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
            <div className="absolute left-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </form>

        {/* Навигация и профиль пользователя */}
        <div className="flex items-center gap-4 sm:gap-6"> {/* Добавлен отсутствующий div */}
          {userHydrated && (
            <React.Fragment>
              {user ? (
                /* Профиль пользователя (Стиль Wildberries) */
                <div className="group relative flex flex-col items-center cursor-pointer text-gray-700 hover:text-indigo-600 transition-all">
                  <div className="relative">
                    <User className="w-6 h-6" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-[11px] font-semibold max-w-[70px] truncate">
                      {user.firstName || user.username}
                    </span>
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  </div>

                  {/* Выпадающее меню при наведении */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-3 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        {user.isAdmin ? 'Администратор' : 'Покупатель'}
                      </p>
                    </div>

                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                      <Package className="w-4 h-4 text-gray-400" /> Мои заказы
                    </Link>
                    
                    <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                      <MapPin className="w-4 h-4 text-gray-400" /> Адреса доставки
                    </Link>

                    {user.isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-50 mt-2 pt-2">
                        Панель управления
                      </Link>
                    )}

                    <div className="mt-2 pt-2 border-t border-gray-50 px-2">
                      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Выйти
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Состояние: Гость */
            <Link href="/admin" className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-all group">
                  <div className="p-2 group-hover:bg-indigo-50 rounded-full transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium mt-0.5">Войти</span>
                </Link>
              )}

              {/* Избранное и Корзина (всегда видны) */}
              <Link href="/favorites" className="relative flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
                <span className="text-[11px] font-medium mt-0.5">Избранное</span>
                {isHydrated && favorites.length > 0 && (
                  <span className="absolute -top-1 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-[11px] font-medium mt-0.5">Корзина</span>
                {isHydrated && cart.length > 0 && (
                  <span className="absolute -top-1 right-0 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </Link>
            </React.Fragment>
          )}
        </div> {/* Закрывающий div для группы навигации и профиля */}
      </nav>
    </header>
  );
}