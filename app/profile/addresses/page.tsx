'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../components/UserContext';
import { useToast } from '../../components/ToastProvider';
import { Address } from '../../../lib/server-store';
import { PlusCircle, Edit, Trash2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserAddressesPage() {
  const { user, isHydrated } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/admin');
      showToast('❌ Пожалуйста, войдите в систему для управления адресами.');
    } else if (user) {
      fetchAddresses();
    }
  }, [user, isHydrated, router, showToast]);

  const fetchAddresses = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/user/addresses?username=${user.username}`);
      const data = await response.json();
      if (response.ok) {
        setAddresses(data);
      } else {
        showToast(`❌ Ошибка загрузки адресов: ${data.message}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке адресов:', error);
      showToast('❌ Произошла ошибка сети при загрузке адресов.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) return;

    const method = editingAddress ? 'PUT' : 'POST';
    const url = editingAddress 
      ? `/api/user/addresses?username=${user.username}&id=${editingAddress.id}`
      : `/api/user/addresses?username=${user.username}`;
    const body = editingAddress ? editingAddress : newAddress;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        fetchAddresses();
        setIsAdding(false);
        setEditingAddress(null);
        setNewAddress({ street: '', city: '', postalCode: '', country: '' });
      } else {
        showToast(`❌ ${data.message || 'Ошибка сохранения адреса.'}`);
      }
    } catch (error) {
      showToast('❌ Произошла ошибка сети при сохранении адреса.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user?.username || !confirm('Вы уверены, что хотите удалить этот адрес?')) return;
    try {
      const response = await fetch(`/api/user/addresses?username=${user.username}&id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast(`✅ Адрес удален`);
        fetchAddresses();
      }
    } catch (error) {
      showToast('❌ Ошибка при удалении.');
    }
  };

  if (!isHydrated || loading) {
    return <div className="p-8 text-center min-h-screen flex items-center justify-center">Загрузка адресов...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Мои адреса доставки</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingAddress(null);
            setNewAddress({ street: '', city: '', postalCode: '', country: '' });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {isAdding ? 'Отменить' : 'Добавить новый адрес'}
        </button>

        {(isAdding || editingAddress) && (
          <form onSubmit={handleAddOrUpdateAddress} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Улица, дом, квартира</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editingAddress ? editingAddress.street : newAddress.street}
                onChange={(e) => editingAddress ? setEditingAddress({...editingAddress, street: e.target.value}) : setNewAddress({...newAddress, street: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Город</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editingAddress ? editingAddress.city : newAddress.city}
                onChange={(e) => editingAddress ? setEditingAddress({...editingAddress, city: e.target.value}) : setNewAddress({...newAddress, city: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Индекс</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editingAddress ? editingAddress.postalCode : newAddress.postalCode}
                onChange={(e) => editingAddress ? setEditingAddress({...editingAddress, postalCode: e.target.value}) : setNewAddress({...newAddress, postalCode: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Страна</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editingAddress ? editingAddress.country : newAddress.country}
                onChange={(e) => editingAddress ? setEditingAddress({...editingAddress, country: e.target.value}) : setNewAddress({...newAddress, country: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Сохранить</button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{address.street}, {address.city}</p>
                <p className="text-sm text-gray-600">{address.postalCode}, {address.country}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setEditingAddress(address)} className="text-indigo-600 p-2"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDeleteAddress(address.id)} className="text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}