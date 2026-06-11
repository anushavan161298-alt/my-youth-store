'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination, Zoom } from 'swiper/modules';

// Импорт стилей Swiper (убедитесь, что они установлены в вашем проекте)
// Если вы уже импортируете их в другом месте (например, в global.css или ProductCard.tsx),
// то повторно импортировать здесь не обязательно, но это гарантирует, что стили будут доступны.
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
import 'swiper/css/zoom'; // Для функциональности зума

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Заглушка для изображений, если они отсутствуют или не загрузились
  const defaultImage = 'https://via.placeholder.com/800x800?text=Нет+фото';
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Ошибка+загрузки';
  };

  // Гарантируем, что images - это всегда массив
  const safeImages = Array.isArray(images) ? images : [];

  if (!mounted) return <div className="w-full aspect-square bg-gray-50 rounded-lg animate-pulse" />;

  return (
    <div className="w-full">
      {/* Основной слайдер изображений */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Zoom, Pagination]}
        className="main-product-swiper mb-4 rounded-lg shadow-md border border-gray-100"
        pagination={{ clickable: true, type: 'fraction' }} // Показывает "1/3" как на WB
        zoom={true}
        observer={true}
        observeParents={true}
      >
        {safeImages.length > 0 ? (
          safeImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container"> {/* Контейнер для зума */}
                <img
                  src={img}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full h-auto object-contain max-h-[600px] mx-auto"
                  onError={handleError}
                />
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="flex items-center justify-center w-full h-[400px] bg-gray-100 text-gray-400 text-xl italic rounded-lg">
              Нет фото
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Слайдер миниатюр */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={safeImages.length < 4 ? safeImages.length : 4} // Динамическое кол-во
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbs-swiper"
        observer={true}
        observeParents={true}
      >
        {safeImages.length > 0 ? (
          safeImages.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                alt={`${productName} - миниатюра ${index + 1}`}
                className="w-full h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-colors"
                onError={handleError}
              />
            </SwiperSlide>
          ))
        ) : (
          // Заглушки для миниатюр, если нет изображений
          Array.from({ length: 4 }).map((_, index) => (
            <SwiperSlide key={index}>
              <div className="flex items-center justify-center w-full h-20 bg-gray-100 text-gray-300 text-xs italic rounded-md">
                Нет фото
              </div>
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </div>
  );
};

export default ProductGallery;