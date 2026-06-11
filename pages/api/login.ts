// c:\Users\PC\Documents\project\my-youth-store\pages\api\login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { usersStore, User } from '../../lib/server-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны.' });
  }

  const user: User | undefined = usersStore[username];
  console.log(`[API Login] Попытка входа для: ${username}`);
  console.log('[API Login] Текущие пользователи в usersStore:', Object.keys(usersStore));

  // ВНИМАНИЕ: В реальном приложении здесь должна быть проверка хешированного пароля
  if (user && user.password === password) {
    // В реальном приложении здесь бы генерировался JWT токен или сессия
    // Для демонстрации, возвращаем данные пользователя (без пароля)
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json({ message: 'Вход выполнен успешно!', user: userWithoutPassword });
  } else {
    return res.status(401).json({ message: 'Неверное имя пользователя или пароль.' });
  }
}