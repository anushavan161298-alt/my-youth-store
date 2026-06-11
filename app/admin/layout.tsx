'use client'; // This directive indicates that this component is a Client Component.

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  MessageCircle, 
  LayoutDashboard 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Если мы на странице логина, не показываем меню
  if (pathname === '/admin') return <>{children}</>;

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Поставщики', href: '/admin/suppliers', icon: Users },
    { name: 'Товары', href: '/admin/products', icon: Package },
    { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Отправки', href: '/admin/shipments', icon: Truck },
    { name: 'Чат', href: '/admin/chat', icon: MessageCircle },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Левое меню */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-indigo-600">Youth Store Admin</h2>
        </div>
        <nav className="mt-4 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-xl mb-2 transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Контент страницы */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}