'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastProvider';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Supplier } from '../../../lib/server-store'; // Импортируем интерфейс Supplier

export default function AdminSupplierManagementPage() {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contactPerson: '',
    phone: '',
    link: '',
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      if (response.ok) {
        setSuppliers(Object.values(data));
      } else {
        showToast(`❌ Ошибка загрузки поставщиков: ${data.message}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке поставщиков:', error);
      showToast('❌ Произошла ошибка сети при загрузке поставщиков.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supplierToAdd = { ...newSupplier, id: uuidv4() };
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierToAdd),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setSuppliers((prev) => [...prev, supplierToAdd]);
        setNewSupplier({ name: '', contactPerson: '', phone: '', link: '' });
        setIsAddingSupplier(false);
      } else {
        showToast(`❌ ${data.message || 'Ошибка добавления поставщика.'}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении поставщика:', error);
      showToast('❌ Произошла ошибка сети при добавлении поставщика.');
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      const response = await fetch(`/api/suppliers?id=${editingSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSupplier),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
        );
        setEditingSupplier(null);
      } else {
        showToast(`❌ ${data.message || 'Ошибка обновления поставщика.'}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении поставщика:', error);
      showToast('❌ Произошла ошибка сети при обновлении поставщика.');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика?')) return;
    try {
      const response = await fetch(`/api/suppliers?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } else {
        showToast(`❌ ${data.message || 'Ошибка удаления поставщика.'}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении поставщика:', error);
      showToast('❌ Произошла ошибка сети при удалении поставщика.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <p className="text-xl text-gray-600">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center text-indigo-800 mb-8">
        Управление поставщиками
      </h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <button
          onClick={() => {
            setIsAddingSupplier(!isAddingSupplier);
            setEditingSupplier(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {isAddingSupplier ? 'Отменить добавление' : 'Добавить нового поставщика'}
        </button>

        {(isAddingSupplier || editingSupplier) && (
          <form onSubmit={editingSupplier ? handleUpdateSupplier : handleAddSupplier} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Имя поставщика</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSupplier ? editingSupplier.name : newSupplier.name}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, name: e.target.value })
                    : setNewSupplier({ ...newSupplier, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Контактное лицо</label>
              <input
                type="text"
                id="contactPerson"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSupplier ? editingSupplier.contactPerson : newSupplier.contactPerson}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })
                    : setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Телефон</label>
              <input
                type="text"
                id="phone"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                    : setNewSupplier({ ...newSupplier, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">Ссылка (ТГ/ВК)</label>
              <input
                type="text"
                id="link"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingSupplier ? editingSupplier.link : newSupplier.link}
                onChange={(e) =>
                  editingSupplier
                    ? setEditingSupplier({ ...editingSupplier, link: e.target.value })
                    : setNewSupplier({ ...newSupplier, link: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingSupplier ? 'Сохранить изменения' : 'Добавить поставщика'}
              </button>
              {editingSupplier && (
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Отменить
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Список поставщиков</h2>
        {suppliers.length === 0 ? (
          <p className="text-gray-600">Поставщики пока не добавлены.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контактное лицо
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ссылка
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.contactPerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                      <a href={supplier.link} target="_blank" rel="noopener noreferrer">{supplier.link}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingSupplier(supplier)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}