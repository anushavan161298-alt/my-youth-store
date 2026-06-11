'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import { useToast } from './components/ToastProvider';
import { useStore } from './components/StoreContext';
import { Product } from '../lib/server-store'; // Импортируем из server-store
import { useUser } from './components/UserContext'; // Путь верный
import { useRouter } from 'next/navigation';

const ProductCard = ({ product }: { product: Product }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { user } = useUser(); // Получаем user из контекста
  const { showToast } = useToast();
  const { toggleFavorite, isFavorite, addToCart } = useStore();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const sizes = product.size?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const colors = product.color?.split(',').map(c => c.trim()).filter(Boolean) || [];

  // Сброс выбора при закрытии меню
  useEffect(() => {
    if (!showOptions) {
      setSelectedSize('');
      setSelectedColor('');
    }
  }, [showOptions]);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden w-full max-w-[280px] flex flex-col">
      {/* Слайдер изображений */}
      <div className="relative h-80 w-full overflow-hidden">
        {mounted ? (
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="h-full w-full product-card-swiper"
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <img 
                      src={img} 
                      alt={`${product.name} - ${index}`} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Ошибка+загрузки'; }}
                    />
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <Link href={`/product/${product.id}`} className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400 text-xs italic">
                  Нет фото
                </Link>
              </SwiperSlide>
            )}
          </Swiper>
        ) : (
          <div className="h-full w-full bg-gray-50" />
        )}
        
        {product.discountPrice && product.sellingPrice && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{Math.round((1 - product.discountPrice / product.sellingPrice) * 100)}%
          </div>
        )}
      </div>

      <button 
        onClick={() => {
          if (!user) {
            showToast('❌ Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в избранное!');
            return;
          }
          toggleFavorite(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
          isFavorite(product.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
      </button>

      {/* Оверлей выбора размера и цвета при добавлении в корзину */}
      {showOptions && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center animate-in fade-in duration-200">
          <button 
            onClick={(e) => { e.preventDefault(); setShowOptions(false); }}
            className="absolute top-2 right-2 text-gray-400 hover:text-black p-1"
          >
            ✕
          </button>
          
          <div className="space-y-4">
            {sizes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Размер:</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        selectedSize === size 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'border-gray-200 text-gray-600 hover:border-indigo-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Цвет:</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        selectedColor === color 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'border-gray-200 text-gray-600 hover:border-indigo-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (sizes.length > 0 && !selectedSize) { showToast('⚠️ Выберите размер'); return; }
                if (colors.length > 0 && !selectedColor) { showToast('⚠️ Выберите цвет'); return; }
                
                const finalSize = selectedSize || 'Any';
                addToCart(product, finalSize, selectedColor || undefined);
                showToast(`✅ Добавлено: ${product.name} (${finalSize}${selectedColor ? `, ${selectedColor}` : ''})`);
                setShowOptions(false);
              }}
              className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg"
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}

      {/* Основная информация о товаре, кликабельная для перехода на страницу товара */}
      <Link href={`/product/${product.id}`} className="flex-grow block p-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-extrabold text-black">
            {product.discountPrice || product.sellingPrice} ₽
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              {product.sellingPrice} ₽
            </span>
          )}
        </div>
        
        <h3 className="text-sm text-gray-600 truncate mb-2 hover:text-indigo-600 transition-colors">{product.name}</h3>
        
        {product.description && (
          <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 leading-tight">{product.description}</p>
        )}
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700">{product.rating || 0}</span>
          <span className="text-xs text-gray-400">({product.reviews || 0} отзывов)</span>
        </div>

        {/* Размеры */}
        <div className="flex flex-wrap gap-1 mb-4">
          {sizes.slice(0, 5).map(size => (
            <span key={size} className="text-[10px] px-2 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600">
              {size}
            </span>
          ))}
          {sizes.length > 5 && <span className="text-[10px] text-gray-400">...</span>}
        </div>
      </Link>

      {/* Кнопка "В корзину" (вне основной кликабельной области для навигации) */}
      <div className="p-4 pt-0">
        <button 
          onClick={() => { // Modified to check user authentication
            if (!user) {
              showToast('❌ Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в корзину!');
              return;
            }
            setShowOptions(true);
          }}
          className="w-full bg-indigo-600 hover:bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300 font-medium"
        >
          <ShoppingCart className="w-4 h-4" />
          В корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;