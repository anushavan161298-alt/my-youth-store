import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { usersStore, passwordResetTokens } from '../../lib/server-store';
import { v4 as uuidv4 } from 'uuid'; // Для генерации уникального токена

// Установите uuid: npm install uuid
// Установите типы для uuid: npm install --save-dev @types/uuid

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Ошибка: Переменные окружения EMAIL_USER или EMAIL_PASS не установлены.');
    return res.status(500).json({ message: 'Ошибка сервера: Настройки почты неполные. Обратитесь к администратору.' });
  }

  const { identifier } = req.body; // Может быть username или email

  if (!identifier) {
    return res.status(400).json({ message: 'Имя пользователя или Email обязательны.' });
  }

  // Находим пользователя по username или email и сохраняем его логин (ключ в usersStore)
  let username = identifier;
  let user = usersStore[username];

  if (!user) {
    const entry = Object.entries(usersStore).find(([name, u]) => u.email === identifier);
    if (entry) {
      username = entry[0];
      user = entry[1];
    }
  }

  if (!user) {
    return res.status(404).json({ message: 'Пользователь с таким именем или email не найден.' });
  }

  const resetToken = uuidv4();
  const expiryTime = Date.now() + 3600000; // Токен действителен 1 час

  passwordResetTokens[resetToken] = {
    username: username,
    timestamp: expiryTime,
  };
  console.log(`[Forgot Password] Токен сброса создан для ${username}: ${resetToken}`);

  // Ссылка для сброса пароля
  // В реальном приложении используйте ваш домен: https://yourdomain.com/reset-password/${resetToken}
  const resetLink = `http://localhost:3000/reset-password/${resetToken}?username=${encodeURIComponent(username)}`;

  // Настройка Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Сброс пароля для вашего аккаунта YOUTH STORE',
      html: `
        <p>Здравствуйте, ${user.firstName || username}!</p>
        <p>Ваши данные для входа в аккаунт <b>YOUTH STORE</b>:</p>
        <ul>
          <li><b>Логин:</b> ${username}</li>
          <li><b>Текущий пароль:</b> ${user.password}</li>
        </ul>
        <hr />
        <p>Если вы хотите изменить пароль, перейдите по ссылке:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Эта ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали эти данные, пожалуйста, проигнорируйте это письмо.</p>
        <p>С уважением,<br/>Команда YOUTH STORE</p>
      `,
    });
    res.status(200).json({ message: 'Логин и пароль отправлены на ваш email.' });
  } catch (error) {
    console.error('Ошибка отправки письма для сброса пароля:', (error as Error).message || error);
    res.status(500).json({ message: `Ошибка при отправке письма: ${(error as Error).message || 'Неизвестная ошибка'}` });
  }
}