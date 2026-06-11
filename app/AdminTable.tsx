'use client';

import React from 'react'; // Исправлен путь импорта
import type { Product } from '../lib/server-store';
import { Pencil, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from './components/ToastProvider';

interface AdminTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AdminTable = ({ products, onEdit, onDelete }: AdminTableProps) => { 
  const { showToast } = useToast();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-900">Артикул</th>
            <th className="px-6 py-4 font-medium text-gray-900">Товар</th>
            <th className="px-6 py-4 font-medium text-gray-900">Поставщик</th>
            <th className="px-6 py-4 font-medium text-gray-900">Закупка</th>
            <th className="px-6 py-4 font-medium text-gray-900">Продажа</th>
            <th className="px-6 py-4 font-medium text-gray-900">Прибыль</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td 
                className="px-6 py-4 font-mono text-xs cursor-pointer hover:text-indigo-600 transition-colors"
                title="Нажмите, чтобы скопировать артикул"
                onClick={() => {
                  navigator.clipboard.writeText(p.article);
                  showToast(`Артикул ${p.article} скопирован!`);
                }}
              >
                {p.article}
              </td>
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                  <img 
                    src={p.images?.[0] || 'https://via.placeholder.com/40?text=No+Img'} 
                    alt="" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <span className="font-medium text-gray-900">{p.name}</span>
              </td>
              <td className="px-6 py-4">{p.supplierId}</td> {/* Исправлено: отображаем supplierId */}
              <td className="px-6 py-4 text-red-600">{p.purchasePrice} ₽</td>
              <td className="px-6 py-4 text-green-600">{p.discountPrice || p.sellingPrice} ₽</td>
              <td className="px-6 py-4 font-bold">
                {(p.discountPrice || p.sellingPrice) - p.purchasePrice} ₽
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <Link href={`/product/${p.id}`} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => onEdit(p)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};