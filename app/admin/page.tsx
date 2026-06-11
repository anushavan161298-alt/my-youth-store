'use client';

import React from 'react';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../components/UserContext';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { showToast } = useToast();
  const { isHydrated, setUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.message}`);
        // Обновляем состояние в контексте (автоматически сохранится в localStorage)
        setUser(data.user);
        if (data.user && data.user.isAdmin) { //
          router.push('/admin/dashboard'); // Перенаправление на главную страницу администратора
        } else {
          router.push('/'); // Перенаправление на главную для обычных пользователей
        }
      } else {
        showToast(`❌ ${data.message || 'Ошибка входа.'}`);
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      showToast('❌ Произошла ошибка сети.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-50 rounded-full">
            <LogIn className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Вход в систему</h2>
        <input
          type="text"
          placeholder="Имя пользователя"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right mb-6">
          <Link href="/admin/forgot-password" className="text-sm text-indigo-600 hover:underline font-medium">
            Забыли пароль?
          </Link>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Нет аккаунта? <Link href="/register" className="text-indigo-600 hover:underline font-medium">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}