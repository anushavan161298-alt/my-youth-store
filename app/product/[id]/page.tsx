'use client';

import React, { useEffect, useState } from 'react'; // Удален импорт 'use'
import type { Product } from '../../../lib/server-store';
import ProductGallery from '../../admin/orders/ProductGallery';
import { useToast } from '../../components/ToastProvider';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useUser } from '../../components/UserContext';
import { useStore } from '../../components/StoreContext';

interface ProductPageProps {
  params: { // В клиентских компонентах 'params' - это обычный объект, а не Promise
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = params; // Теперь 'id' деструктурируется напрямую из 'params'
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useUser();
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  // State for selected options
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${id}`);
        if (!response.ok) {
          throw new Error('Товар не найден');
        }
        const data = await response.json();
        // Ensure images is always an array, even if empty or null from API
        setProduct({ ...data, images: data.images || [] });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center p-8 min-h-screen flex items-center justify-center">Загрузка товара...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500 min-h-screen flex items-center justify-center">Ошибка: {error}</div>;
  }

  if (!product) {
    return <div className="text-center p-8 text-gray-600 min-h-screen flex items-center justify-center">Товар не найден.</div>;
  }

  const handleAddToCart = () => {
    if (!user) {
      showToast('❌ Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в корзину!');
      return;
    }
    const sizes = product.size?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const colors = product.color?.split(',').map(c => c.trim()).filter(Boolean) || [];

    if (sizes.length > 0 && !selectedSize) {
      showToast('⚠️ Выберите размер');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      showToast('⚠️ Выберите цвет');
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    showToast(`✅ Добавлено: ${product.name} (${selectedSize || 'Any'}${selectedColor ? `, ${selectedColor}` : ''})`);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      showToast('❌ Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в избранное!');
      return;
    }
    toggleFavorite(product);
  };

  const mainImageUrl = product.images?.[0] || '/placeholder-image.png';

  return (
    <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Open Graph / JSON-LD meta tags could go here, using mainImageUrl */}
      {/* Example: <meta property="og:image" content={mainImageUrl} /> */}
      {/* Example: <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "Product", "image": mainImageUrl, "name": product.name })}</script> */}

      {/* Левая колонка: Галерея изображений */}
      <div>
        <ProductGallery images={product.images || []} productName={product.name} />
      </div>

      {/* Правая колонка: Информация о товаре */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
        <p className="text-2xl font-bold text-indigo-600 mb-6">
          {product.discountPrice ? product.discountPrice : product.sellingPrice} ₽
          {product.discountPrice && (
            <span className="text-base text-gray-400 line-through ml-3">
              {product.sellingPrice} ₽
            </span>
          )}
        </p>
        <p className="text-gray-700 mb-6">{product.description}</p>

        {/* Выбор размера */}
        {(product.size?.split(',').map(s => s.trim()).filter(Boolean).length || 0) > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Размер:</h3>
            <div className="flex flex-wrap gap-2">
              {(product.size?.split(',').map(s => s.trim()).filter(Boolean) || []).map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 bg-gray-100 rounded-md text-sm border ${selectedSize === size ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Выбор цвета */}
        {(product.color?.split(',').map(c => c.trim()).filter(Boolean).length || 0) > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Цвет:</h3>
            <div className="flex flex-wrap gap-2">
              {(product.color?.split(',').map(c => c.trim()).filter(Boolean) || []).map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 bg-gray-100 rounded-md text-sm border ${selectedColor === color ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Рейтинг и отзывы */}
        <div className="flex items-center gap-1 mb-6">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-700">{product.rating || 0}</span>
          <span className="text-sm text-gray-400">({product.reviews || 0} отзывов)</span>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Добавить в корзину
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-xl transition-all ${isFavorite(product.id) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}