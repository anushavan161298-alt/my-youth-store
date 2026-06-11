'use client';

import React from 'react';
import { useUser } from '../../components/UserContext';
import { ShoppingBag, Users, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useUser();

  const stats = [
    { label: 'Всего товаров', value: '124', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Поставщиков', value: '12', icon: Users, iconColor: 'text-green-600', color: 'bg-green-500' },
    { label: 'Новых заказов', value: '5', icon: AlertCircle, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Добро пожаловать, {user?.firstName || 'Администратор'}!</h1>
      <p className="text-gray-500 mb-8">Вот краткий обзор вашего магазина на сегодня.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.color} text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Здесь позже появятся графики и список последних заказов */}
    </div>
  );
}