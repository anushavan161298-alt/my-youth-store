'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../components/StoreContext';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastProvider'; // Added Wallet and Truck for icons
import { Trash2, ShoppingBag, CreditCard, Wallet, Truck } from 'lucide-react';
import { MapPin, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '../components/StoreContext';
import { Address } from '../../lib/server-store';

export default function CartPage() {
  const { cart, removeFromCart, updateCartItem, clearCart, isHydrated } = useStore();
  const { user } = useUser();
  const { showToast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Для выборочного заказа
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '', city: '', postalCode: '', country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp' | null>(null); // Updated: 'cash' removed, 'sbp' added
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New state for payment processing

  const getItemKey = (item: CartItem) => `${item.productId}-${item.size || ''}-${item.color || ''}`;

  const selectedCartItems = cart.filter(item => selectedItems.includes(getItemKey(item)));
  const selectedTotalAmount = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRealPayment = async () => {
    if (!selectedAddressId) {
        showToast('❌ Пожалуйста, выберите адрес доставки.');
        return;
    }
    if (!paymentMethod) {
        showToast('❌ Пожалуйста, выберите способ оплаты.');
        return;
    }
    if (selectedItems.length === 0) {
        showToast('❌ Выберите товары для оформления заказа.');
        return;
    }

    setIsProcessingPayment(true);
    showToast('🚀 Перенаправляем на оплату...');

    try {
      const deliveryAddress = userAddresses.find(addr => addr.id === selectedAddressId);
      const orderData = {
        username: user.username,
        items: selectedCartItems,
        totalAmount: selectedTotalAmount,
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod,
      };

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData }),
      });

      const data = await response.json();
      if (response.ok) {
        selectedCartItems.forEach(item => removeFromCart(item.productId, item.size, item.color));
        window.location.href = data.confirmationUrl; // Перенаправляем на ЮKassa
      } else {
        showToast(`❌ Ошибка: ${data.message}`);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      showToast('❌ Ошибка сети.');
      setIsProcessingPayment(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user?.username) return;
    try {
      const response = await fetch(`/api/user/addresses?username=${user.username}`);
      const data = await response.json();
      if (response.ok) {
        setUserAddresses(data);
        if (data.length > 0 && !selectedAddressId) {
          setSelectedAddressId(data[0].id); // Выбираем первый адрес по умолчанию
        }
      } else {
        showToast(`❌ Ошибка загрузки адресов: ${data.message}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке адресов:', error);
      showToast('❌ Произошла ошибка сети при загрузке адресов.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;

    try {
      const response = await fetch(`/api/user/addresses?username=${user.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        fetchAddresses();
        setShowAddressForm(false);
        setNewAddress({ street: '', city: '', postalCode: '', country: '' });
        setSelectedAddressId(data.address.id); // Выбираем только что добавленный адрес
      } else {
        showToast(`❌ ${data.message || 'Ошибка добавления адреса.'}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении адреса:', error);
      showToast('❌ Произошла ошибка сети при добавлении адреса.');
    }
  };

  useEffect(() => {
    if (isHydrated && user) {
      fetchAddresses();
    } else if (isHydrated && !user) {
      showToast('⚠️ Войдите в систему, чтобы управлять корзиной и адресами.');
    }
  }, [user, isHydrated]);

  const handleToggleSelectItem = (item: CartItem) => {
    const key = getItemKey(item);
    setSelectedItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleUpdateItemSize = (item: CartItem, newSize: string) => {
    updateCartItem(item.productId, item.size, item.color, { size: newSize });
    // Обновляем ключ в списке выбранных, если товар был отмечен
    const oldKey = getItemKey(item);
    const newKey = getItemKey({ ...item, size: newSize });
    if (selectedItems.includes(oldKey)) {
      setSelectedItems(prev => prev.map(k => k === oldKey ? newKey : k));
    }
  };

  const handleUpdateItemColor = (item: CartItem, newColor: string) => {
    updateCartItem(item.productId, item.size, item.color, { color: newColor });
    const oldKey = getItemKey(item);
    const newKey = getItemKey({ ...item, color: newColor });
    if (selectedItems.includes(oldKey)) {
      setSelectedItems(prev => prev.map(k => k === oldKey ? newKey : k));
    }
  };

  if (!isHydrated) return <div className="p-8 text-center min-h-screen flex items-center justify-center">Загрузка...</div>;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-8">Самое время добавить в неё что-нибудь интересное!</p>
        <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">
          В магазин
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">Корзина</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item: CartItem, index) => {
            // Защита: если объект товара отсутствует, не рендерим строку
            if (!item.product) return null;

            const productSizes = item.product.size?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const productColors = item.product.color?.split(',').map(c => c.trim()).filter(Boolean) || [];

            return (
              <div key={`${item.productId}-${index}`} className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(getItemKey(item))}
                  onChange={() => handleToggleSelectItem(item)}
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out mr-4"
                />
                <div className="flex-grow flex items-center">
                  <img 
                    src={item.product.images?.[0] || '/placeholder-image.png'} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                    
                    {productSizes.length > 0 && (
                      <div className="flex items-center mt-2">
                        <label htmlFor={`size-${getItemKey(item)}`} className="text-sm text-gray-600 mr-2">Размер:</label>
                        <select
                          id={`size-${getItemKey(item)}`}
                          value={item.size || ''} // Убедитесь, что item.size не undefined
                          onChange={(e) => handleUpdateItemSize(item, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {productSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {productColors.length > 0 && (
                      <div className="flex items-center mt-2">
                        <label htmlFor={`color-${getItemKey(item)}`} className="text-sm text-gray-600 mr-2">Цвет:</label>
                        <select
                          id={`color-${getItemKey(item)}`}
                          value={item.color || ''} // Убедитесь, что item.color не undefined
                          onChange={(e) => handleUpdateItemColor(item, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {productColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-baseline space-x-2 mt-2">
                      <p className="text-indigo-600 font-black text-xl">{item.price} ₽</p>
                      {item.product.purchasePrice > item.price && (
                        <p className="text-sm text-gray-400 line-through">
                          {Math.round(item.price * 1.2)} ₽
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId, item.size, item.color)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Правая колонка: Выбор адреса доставки и Итого к оплате. */}
        {/* Делаем всю эту колонку sticky, чтобы она прокручивалась вместе с контентом, но оставалась видимой. */}
        <div className="lg:col-span-1 flex flex-col gap-10 h-fit sticky top-8">
          {/* Выбор адреса доставки */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mt-10 lg:mt-0"> {/* Убираем верхний отступ на больших экранах */}
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Адрес доставки</h2>
          {userAddresses.length === 0 && !showAddressForm ? (
            <p className="text-gray-600 mb-4">У вас пока нет сохраненных адресов.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {userAddresses.map(address => (
                <label key={address.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => { setSelectedAddressId(address.id); setShowAddressForm(false); }}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{address.street}, {address.city}</p>
                      <p className="text-sm text-gray-600">{address.postalCode}, {address.country}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{showAddressForm ? 'Отменить добавление' : 'Добавить новый адрес'}</span>
          </button>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {['street', 'city', 'postalCode', 'country'].map(field => (
                <div key={field}>
                  <label htmlFor={`new-address-${field}`} className="block text-sm font-medium text-gray-700">
                    {field === 'street' && 'Улица, дом, квартира'}
                    {field === 'city' && 'Город'}
                    {field === 'postalCode' && 'Почтовый индекс'}
                    {field === 'country' && 'Страна'}
                  </label>
                  <input
                    type="text"
                    id={`new-address-${field}`}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={(newAddress as any)[field]}
                    onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Сохранить адрес
                </button>
              </div>
            </form>
          )}
        </div>

          {/* Выбор способа оплаты */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Способ оплаты</h2>
            <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-500" /> {/* Иконка для карты */}
                    <span className="font-medium text-gray-900">Банковской картой</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="sbp"
                        checked={paymentMethod === 'sbp'}
                        onChange={() => setPaymentMethod('sbp')}
                        className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <Wallet className="w-5 h-5 text-gray-500" /> {/* Иконка для СБП, можно заменить на более подходящую */}
                    <span className="font-medium text-gray-900">По СБП</span>
                </label>
            </div>
          </div>

          {/* Итого к оплате */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Итого к оплате</h2>
          <div className="flex justify-between items-center mb-8 pb-6 border-b">
            <span className="text-gray-500">Общая стоимость:</span>
            <span className="text-3xl font-black text-black">{selectedTotalAmount} ₽</span>
          </div>
          <button 
            onClick={handleRealPayment}
            disabled={selectedItems.length === 0 || !selectedAddressId || !paymentMethod || isProcessingPayment}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
          >
            {isProcessingPayment ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Обработка...
                </>
              ) : (
                <>
            <CreditCard className="w-5 h-5" />
            Оформить выбранные ({selectedItems.length})
                </>
              )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}