import type { NextApiRequest, NextApiResponse } from 'next';
import { usersStore, passwordResetTokens, saveUsers } from '../../lib/server-store';
// import bcrypt from 'bcryptjs'; // В реальном приложении используйте bcrypt для хеширования паролей

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
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
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword; // Временно, без хеширования
    saveUsers(); // СОХРАНЯЕМ В ФАЙЛ

    delete passwordResetTokens[token]; // Удаляем использованный токен

    res.status(200).json({ message: 'Пароль успешно сброшен! Теперь вы можете войти с новым паролем.' });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', (error as Error).message || error);
    res.status(500).json({ message: `Ошибка сервера при сбросе пароля: ${(error as Error).message || 'Неизвестная ошибка'}` });
  }
}