'use client';

import React, { useState, Suspense } from 'react';
import { useToast } from '../../../components/ToastProvider'; // Исправлен путь
import { useToast } '../../../components/ToastProvider'; // Исправлен путь
import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent({ token }: { token: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !token) {
      showToast('❌ Неверная ссылка для сброса пароля.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('❌ Пароли не совпадают.');
      setLoading(false);
      return;
    }

    // Basic password validation (can be enhanced)
    if (newPassword.length < 6) {
      showToast('❌ Пароль должен быть не менее 6 символов.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.message}`);
        router.push('/admin'); // Перенаправляем на страницу входа
      } else {
        showToast(`❌ ${data.message || 'Ошибка при сбросе пароля.'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса на сброс пароля:', error);
      showToast('❌ Произошла ошибка сети. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-50 rounded-full">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Установить новый пароль</h2>
        <p className="text-center text-gray-600 mb-4">Введите ваш новый пароль.</p>
        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Повторите новый пароль"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors" disabled={loading}>
          {loading ? 'Установка...' : 'Установить пароль'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/admin" className="text-indigo-600 hover:underline font-medium">Вернуться ко входу</Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  // В Next.js App Router params доступен напрямую
  const { token } = params;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <ResetPasswordContent token={token as string} />
    </Suspense>
  );
}