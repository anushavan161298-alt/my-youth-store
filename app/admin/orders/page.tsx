'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '../../../lib/server-store';
import { useToast } from '../../components/ToastProvider';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (response.ok) {
        setOrders(Object.values(data));
      } else {
        showToast(`❌ Ошибка загрузки заказов: ${data.message}`);
      }
    } catch (error) {
      showToast('❌ Ошибка сети при получении заказов.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast('✅ Статус заказа успешно обновлен!');
      } else {
        showToast('❌ Ошибка при обновлении статуса.');
      }
    } catch (error) {
      showToast('❌ Ошибка сети при обновлении статуса.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Управление заказами</h1>
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-600">Загрузка...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-gray-600">Заказов пока нет.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товары</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Адрес доставки</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...orders].sort((a, b) => b.timestamp - a.timestamp).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items?.map((item, idx) => (
                        <div key={`${order.id}-${item.productId}-${item.size || ''}-${item.color || ''}-${idx}`}>
                          {/* Улучшен ключ для уникальности, учитывая размер и цвет */}
                          {item.name} <span className="text-gray-400">x{item.quantity}</span>
                        </div>
                      )) || 'Нет товаров'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {order.totalAmount} ₽
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.deliveryAddress ? (
                        `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}, ${order.deliveryAddress.country}`
                      ) : (
                        'Адрес не указан'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">В ожидании</option>
                        <option value="shipped">Отправлено</option>
                        <option value="delivered">Доставлено</option>
                        <option value="cancelled">Отменено</option>
                      </select>
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