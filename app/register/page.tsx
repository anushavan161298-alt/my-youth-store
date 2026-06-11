'use client';

import React, { useEffect } from 'react';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastProvider';
import { UserPlus, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { user, isHydrated: userContextHydrated } = useUser(); // Получаем isHydrated из UserContext
  const { showToast } = useToast();
  const router = useRouter();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState(''); // Состояние для полной даты
  const [email, setEmail] = React.useState('');
  const [confirmEmail, setConfirmEmail] = React.useState('');

  const [step, setStep] = React.useState(1); // 1: Ввод данных, 2: Подтверждение кода
  const [verificationCode, setVerificationCode] = React.useState(''); // Восстановлено состояние verificationCode

  // Redirect if already logged in, but only after hydration
  useEffect(() => {
    if (userContextHydrated && user) { // Только редирект, если контекст гидратирован и пользователь вошел
      router.push('/');
    }
  }, [user, router, userContextHydrated]);

  // Если контекст пользователя еще не гидратирован, возвращаем null, чтобы избежать ошибок гидратации (Next.js)
  if (!userContextHydrated) return null;

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('❌ Пароли не совпадают!');
      return;
    }
    if (email !== confirmEmail) { // Assuming confirmEmail is also added
      showToast('❌ Адреса электронной почты не совпадают!');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('❌ Введите корректный адрес электронной почты!');
      return;
    }
    // Валидация даты рождения
    if (!birthDate) {
      showToast('❌ Выберите дату рождения!');
      return;
    }
    if (new Date(birthDate) > new Date()) {
      showToast('❌ Дата рождения не может быть в будущем!');
      return;
    }

    // Отправляем данные на API для инициации регистрации
    try {
      const response = await fetch('/api/register-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName, birthDate, email }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.message}`); // Сообщение от сервера об отправке кода
        setStep(2);
      } else {
        showToast(`❌ ${data.message || 'Ошибка инициации регистрации.'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке данных на API:', error);
      showToast('❌ Произошла ошибка сети. Попробуйте еще раз.');
    }
  };

  const handleStepTwoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Отправляем код на API для верификации
    try {
      const response = await fetch('/api/register-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.message}`);
        router.push('/admin'); // Перенаправляем на страницу входа после успешной регистрации
      } else {
        showToast(`❌ ${data.message || 'Ошибка верификации кода.'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке кода на API:', error);
      showToast('❌ Произошла ошибка сети. Попробуйте еще раз.');
      return;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        {step === 1 ? (
          <form onSubmit={handleStepOneSubmit}>
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-indigo-50 rounded-full">
                <UserPlus className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Регистрация</h2>
            <input
              type="text"
              placeholder="Имя пользователя"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                placeholder="Имя"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Фамилия"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Повторите Email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Продолжить
            </button>
          </form>
        ) : (
          <form onSubmit={handleStepTwoSubmit}>
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-50 rounded-full">
                <MailCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Подтверждение почты</h2>
            <p className="text-sm text-center text-gray-500 mb-6">Введите код, отправленный на {email}</p>
            <input
              type="text"
              placeholder="Код из 6 цифр"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-6 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Подтвердить и зарегистрироваться
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-4 text-sm text-gray-500 hover:text-indigo-600"
            >
              Вернуться к редактированию данных
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-600 mt-4">
          Уже есть аккаунт? <Link href="/admin" className="text-indigo-600 hover:underline font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
}