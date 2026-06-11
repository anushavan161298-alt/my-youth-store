'use client';

import React from 'react';
import { useToast } from '../../components/ToastProvider';
import { MailQuestion } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [identifier, setIdentifier] = React.useState(''); // Может быть email или username
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Проверка на наличие @
    if (!identifier.includes('@') || identifier.length < 5) { // Добавил минимальную длину
      showToast('❌ Введите корректный Email (обязательно должен быть символ @)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/forgot-password-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.message}`);
      } else {
        showToast(`❌ ${data.message || 'Ошибка при запросе сброса пароля.'}`);
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
            <MailQuestion className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Забыли пароль?</h2>
        <p className="text-center text-gray-600 mb-4">Введите ваше имя пользователя или email, и мы отправим вам ссылку для сброса пароля.</p>
        <input
          type="email"
          placeholder="Ваш Email"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors" disabled={loading}>
          {loading ? 'Отправка...' : 'Отправить ссылку для сброса'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/admin" className="text-indigo-600 hover:underline font-medium">Вернуться ко входу</Link>
        </p>
      </form>
    </div>
  );
}