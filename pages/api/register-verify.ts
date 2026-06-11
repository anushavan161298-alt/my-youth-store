import type { NextApiRequest, NextApiResponse } from 'next';
import { usersStore, pendingRegistrations, saveUsers, savePendingRegistrations } from '../../lib/server-store';
import { usersStore, pendingRegistrations, saveUsers, savePendingRegistrations, User } from '../../lib/server-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { // Эта строка уже была правильной
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { username, verificationCode } = req.body;

    const pendingUser = pendingRegistrations[username];

    if (!pendingUser || pendingUser.verificationCode !== verificationCode || (Date.now() - pendingUser.timestamp > 10 * 60 * 1000)) { // Код действителен 10 минут
      return res.status(400).json({ message: 'Неверный или просроченный код подтверждения.' });
    }

    // Регистрация пользователя
    usersStore[username] = { ...pendingUser, isAdmin: false, isEmailConfirmed: true };
    usersStore[username] = { ...pendingUser, isAdmin: false, isEmailConfirmed: true } as User;
    saveUsers(); // Сохраняем обновленный список пользователей в файл
    delete pendingRegistrations[username]; // Удаляем из временного хранилища
    savePendingRegistrations(); // Сохраняем изменения во временных регистрациях

    res.status(200).json({ message: 'Регистрация успешно завершена!' });
  } catch (error) {
    console.error('Ошибка при верификации регистрации:', (error as Error).message || error);
    res.status(500).json({ message: `Ошибка сервера при верификации регистрации: ${(error as Error).message || 'Неизвестная ошибка'}` });
  }
}