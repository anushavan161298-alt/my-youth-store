import type { NextApiRequest, NextApiResponse } from 'next';
import { usersStore, saveUsers, User, Address } from '../../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query; // Предполагаем, что username передается как query-параметр

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Имя пользователя обязательно.' });
  }

  const user = usersStore[username];

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден.' });
  }

  if (req.method === 'GET') {
    // Получить все адреса для пользователя
    return res.status(200).json(user.addresses || []);
  } else if (req.method === 'POST') {
    // Добавить новый адрес
    const newAddress: Address = { ...req.body, id: uuidv4() };
    if (!newAddress.street || !newAddress.city || !newAddress.postalCode || !newAddress.country) {
      return res.status(400).json({ message: 'Не все обязательные поля адреса заполнены.' });
    }
    
    if (!user.addresses) {
      user.addresses = [];
    }
    user.addresses.push(newAddress);
    saveUsers();
    return res.status(201).json({ message: 'Адрес успешно добавлен.', address: newAddress });
  } else if (req.method === 'PUT') {
    // Обновить существующий адрес
    const { id } = req.query;
    const updatedAddress: Address = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID адреса обязателен для обновления.' });
    }

    if (!user.addresses) {
      return res.status(404).json({ message: 'Адреса для пользователя не найдены.' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr.id === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Адрес не найден.' });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updatedAddress };
    saveUsers();
    return res.status(200).json({ message: 'Адрес успешно обновлен.', address: user.addresses[addressIndex] });
  } else if (req.method === 'DELETE') {
    // Удалить адрес
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID адреса обязателен для удаления.' });
    }

    if (!user.addresses) {
      return res.status(404).json({ message: 'Адреса для пользователя не найдены.' });
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(addr => addr.id !== id);

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: 'Адрес не найден.' });
    }

    saveUsers();
    return res.status(200).json({ message: 'Адрес успешно удален.' });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}