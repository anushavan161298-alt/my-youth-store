import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { usersStore, pendingRegistrations, savePendingRegistrations, User } from '../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Ошибка: Переменные окружения EMAIL_USER или EMAIL_PASS не установлены.');
    return res.status(500).json({ message: 'Ошибка сервера: Настройки почты неполные. Обратитесь к администратору.' });
  }

  const { username, password, firstName, lastName, birthDate, email } = req.body;

  if (!username || !password || !firstName || !lastName || !birthDate || !email) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
  }

  try {
    // 1. Проверка на существование пользователя с таким же username или email
    if (usersStore[username]) {
      return res.status(409).json({ message: 'Пользователь с таким именем уже существует.' });
    }
    const existingUserByEmail = Object.values(usersStore).find(u => u.email === email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Пользователь с таким Email уже зарегистрирован.' });
    }

    // 2. Генерация кода подтверждения
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
    const expiryTime = Date.now() + 10 * 60 * 1000; // Код действителен 10 минут

    // 3. Сохранение данных о регистрации во временном хранилище
    pendingRegistrations[username] = {
      username,
      password, // ВНИМАНИЕ: В реальном приложении здесь нужно хешировать пароль!
      firstName,
      lastName,
      birthDate,
      email,
      verificationCode,
      timestamp: expiryTime,
    };
    savePendingRegistrations(); // Сохраняем временную регистрацию в файл

    // 4. Отправка письма с кодом подтверждения
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Код подтверждения регистрации в YOUTH STORE',
      html: `
        <p>Здравствуйте, ${firstName}!</p>
        <p>Ваш код подтверждения для регистрации в YOUTH STORE: <b>${verificationCode}</b></p>
        <p>Этот код действителен в течение 10 минут.</p>
        <p>Если вы не запрашивали регистрацию, пожалуйста, проигнорируйте это письмо.</p>
        <p>С уважением,<br/>Команда YOUTH STORE</p>
      `,
    });

    res.status(200).json({ message: 'Код подтверждения отправлен на ваш Email.' });

  } catch (error) {
    console.error('Ошибка при инициации регистрации:', (error as Error).message || error);
    res.status(500).json({ message: `Ошибка сервера при инициации регистрации: ${(error as Error).message || 'Неизвестная ошибка'}` });
  }
}