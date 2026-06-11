import type { NextApiRequest, NextApiResponse } from 'next';
import { usersStore, passwordResetTokens } from '../../lib/server-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, token, newPassword } = req.body;

  if (!username || !token || !newPassword) {
    return res.status(400).json({ message: 'Недостаточно данных для сброса пароля.' });
  }

  const resetTokenData = passwordResetTokens[token];

  if (!resetTokenData || resetTokenData.username !== username || resetTokenData.timestamp < Date.now()) {
    return res.status(400).json({ message: 'Неверный или просроченный токен сброса пароля.' });
  }

  const user = usersStore[username];

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден.' });
  }

  // ВНИМАНИЕ: В реальном приложении здесь нужно хешировать новый пароль!
  user.password = newPassword;

  // Удаляем использованный токен
  delete passwordResetTokens[token];

  // Для демонстрации, также обновим localStorage, если пользователь был залогинен
  // В реальном приложении это не нужно, так как пароль будет в БД
  // и пользователь должен будет залогиниться заново.
  // localStorage.setItem('youth-store-user', JSON.stringify(user));

  res.status(200).json({ message: 'Пароль успешно сброшен! Теперь вы можете войти с новым паролем.' });
}