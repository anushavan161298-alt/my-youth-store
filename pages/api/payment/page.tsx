'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import { Order } from '../../lib/server-store';
import { Package, Clock, CheckCircle, Truck, XCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

const statusConfig = {
  waiting_for_payment: { label: 'Ожидает оплаты', color: 'text-orange-600 bg-orange-50', icon: Clock },
  pending: { label: 'В обработке', color: 'text-blue-600 bg-blue-50', icon: Package },
  processing: { label: 'Собирается', color: 'text-indigo-600 bg-indigo-50', icon: Package },
  shipped: { label: 'В пути', color: 'text-purple-600 bg-purple-50', icon: Truck },
  delivered: { label: 'Доставлен', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  cancelled: { label: 'Отменен', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function UserOrdersPage() {
  const { user, isHydrated } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.username) return;
      try {
        const response = await fetch(`/api/orders?username=${user.username}`);
        const data = await response.json();
        if (response.ok) {
          // Сортируем: новые сверху
          setOrders(Array.isArray(data) ? data.sort((a, b: any) => b.timestamp - a.timestamp) : []);
        }
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated && user) fetchOrders();
    else if (isHydrated && !user) setLoading(false);
  }, [user, isHydrated]);

  if (!isHydrated || loading) return <div className="p-20 text-center text-gray-500">Загрузка истории заказов...</div>;

  if (!user) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Пожалуйста, войдите в систему</h2>
        <Link href="/admin" className="text-indigo-600 hover:underline font-medium">Перейти ко входу</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <Package className="w-8 h-8 text-indigo-600" />
        <h1 className="text-4xl font-extrabold text-gray-900">Мои заказы</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
          <p className="text-gray-500 mb-6 text-lg">Вы еще ничего не заказывали.</p>
          <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">
            Начать покупки
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = (statusConfig as any)[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Заказ #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="text-gray-800">
                          <span className="font-bold">{item.name}</span>
                          {item.size && <span className="ml-2 text-gray-400">размер: {item.size}</span>}
                          <span className="ml-2 text-gray-400">x{item.quantity}</span>
                        </div>
                        <p className="font-semibold text-gray-900">{item.price * item.quantity} ₽</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CreditCard className="w-4 h-4" />
                      {order.paymentMethod === 'sbp' ? 'СБП' : 'Банковская карта'}
                    </div>
                    <p className="text-xl font-black text-gray-900">Итого: {order.totalAmount} ₽</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}