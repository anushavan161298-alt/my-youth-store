'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastProvider';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Product, Supplier } from '../../../lib/server-store'; // Импортируем интерфейсы

export default function AdminProductManagementPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    size: '',
    sellingPrice: 0,
    purchasePrice: 0,
    supplierId: '',
    description: '',
    discountPrice: 0, // Добавлено, так как в интерфейсе Product есть discountPrice
    color: '', // Инициализируем цвет
    article: '', // Инициализируем артикул
    images: [],
    category: '', // Инициализируем категорию
    rating: 0, // Инициализируем рейтинг
    reviews: 0, // Инициализируем количество отзывов
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Синхронизируем изменения с localStorage, чтобы главная страница видела их сразу
  useEffect(() => {
    if (!loading && products.length > 0) {
      localStorage.setItem('youth-store-products', JSON.stringify(products));
    }
  }, [products, loading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/suppliers'),
      ]);

      const productsData = await productsRes.json();
      const suppliersData = await suppliersRes.json();

      if (productsRes.ok) {
        setProducts(Object.values(productsData));
      } else {
        showToast(`❌ Ошибка загрузки товаров: ${productsData.message}`);
      }

      if (suppliersRes.ok) {
        setSuppliers(Object.values(suppliersData));
      } else {
        showToast(`❌ Ошибка загрузки поставщиков: ${suppliersData.message}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      showToast('❌ Произошла ошибка сети при загрузке данных.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.supplierId) {
      showToast('❌ Выберите поставщика.');
      return;
    }
    try {
      const productToAdd = { ...newProduct, id: uuidv4() };
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(productToAdd),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setProducts((prev) => [...prev, data.product]);
        setNewProduct({
          name: '',
          size: '',
          sellingPrice: 0,
          purchasePrice: 0,
          supplierId: '',
          description: '',
          discountPrice: 0,
          color: '',
          article: '',
          category: '',
          rating: 0,
          reviews: 0,
          images: [],
        });
        setIsAddingProduct(false);
      } else {
        showToast(`❌ ${data.message || 'Ошибка добавления товара.'}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      showToast('❌ Произошла ошибка сети при добавлении товара.');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const response = await fetch(`/api/products?id=${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct),
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
        );
        setEditingProduct(null);
      } else {
        showToast(`❌ ${data.message || 'Ошибка обновления товара.'}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      showToast('❌ Произошла ошибка сети при обновлении товара.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        showToast(`❌ ${data.message || 'Ошибка удаления товара.'}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showToast('❌ Произошла ошибка сети при удалении товара.');
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Неизвестный поставщик';
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <p className="text-xl text-gray-600">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8">
        Управление товарами
      </h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <button
          onClick={() => {
            setIsAddingProduct(!isAddingProduct);
            setEditingProduct(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {isAddingProduct ? 'Отменить добавление' : 'Добавить новый товар'}
        </button>

        {(isAddingProduct || editingProduct) && (
          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Наименование</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, name: e.target.value })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">Цена со скидкой (опц.)</label>
              <input
                type="number"
                id="discountPrice"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.discountPrice || '' : newProduct.discountPrice}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, discountPrice: parseFloat(e.target.value) || undefined })
                    : setNewProduct({ ...newProduct, discountPrice: parseFloat(e.target.value) || undefined })
                }
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">Цвета (через запятую)</label>
              <input
                type="text"
                id="color"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.color || '' : newProduct.color}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, color: e.target.value })
                    : setNewProduct({ ...newProduct, color: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="article" className="block text-sm font-medium text-gray-700">Артикул</label>
              <input
                type="text"
                id="article"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.article || '' : newProduct.article}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, article: e.target.value })
                    : setNewProduct({ ...newProduct, article: e.target.value })
                }
                // required // Make optional for existing products
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Изображения (URL, через запятую)
              </label>
              <input
                type="text"
                id="images"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? (editingProduct.images?.join(', ') || '') : (newProduct.images?.join(', ') || '')}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(url => url.trim()) })
                    : setNewProduct({ ...newProduct, images: e.target.value.split(',').map(url => url.trim()) })
                }
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Категория</label>
              <input
                type="text"
                id="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.category || '' : newProduct.category}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, category: e.target.value })
                    : setNewProduct({ ...newProduct, category: e.target.value })
                }
                // required // Make optional for existing products
              />
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">Размер</label>
              <input
                type="text"
                id="size"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.size : newProduct.size}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, size: e.target.value })
                    : setNewProduct({ ...newProduct, size: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">Цена продажная</label>
              <input
                type="number"
                id="sellingPrice"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.sellingPrice : newProduct.sellingPrice}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) })
                    : setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Цена закупочная</label>
              <input
                type="number"
                id="purchasePrice"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.purchasePrice : newProduct.purchasePrice}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) })
                    : setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Рейтинг</label>
              <input
                type="number"
                id="rating"
                step="0.1"
                min="0"
                max="5"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.rating || 0 : newProduct.rating}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) })
                    : setNewProduct({ ...newProduct, rating: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label htmlFor="reviews" className="block text-sm font-medium text-gray-700">Кол-во отзывов</label>
              <input
                type="number"
                id="reviews"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.reviews || 0 : newProduct.reviews}
                onChange={(e) =>
                  editingProduct ? setEditingProduct({ ...editingProduct, reviews: parseInt(e.target.value) }) : setNewProduct({ ...newProduct, reviews: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Поставщик</label>
              <select
                id="supplier"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.supplierId : newProduct.supplierId}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, supplierId: e.target.value })
                    : setNewProduct({ ...newProduct, supplierId: e.target.value })
                }
                required
              >
                <option value="">Выберите поставщика</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editingProduct ? editingProduct.description : newProduct.description}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({ ...editingProduct, description: e.target.value })
                    : setNewProduct({ ...newProduct, description: e.target.value })
                }
                required
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Список товаров</h2>
        {products.length === 0 ? (
          <p className="text-gray-600">Товары пока не добавлены.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Артикул
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Наименование
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цвета
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена (прод.)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена (зак.)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена (скидка)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Поставщик
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Рейтинг
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отзывы
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Изображения
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.article || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.color || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sellingPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.purchasePrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.discountPrice || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSupplierName(product.supplierId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.rating || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.reviews || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.images?.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                      ) : 'Нет'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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