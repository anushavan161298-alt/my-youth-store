import type { NextApiRequest, NextApiResponse } from 'next';
import { ordersStore, saveOrders, Order } from '../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      if (username) {
        // Фильтруем заказы по пользователю
        const userOrders = Object.values(ordersStore).filter(order => order.username === username);
        return res.status(200).json(userOrders);
      }
      return res.status(200).json(ordersStore); // Для админки
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка сервера при получении заказов.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { username, items, totalAmount, deliveryAddress } = req.body;

      if (!username || !items || items.length === 0 || !deliveryAddress) {
        return res.status(400).json({ message: 'Данные заказа неполные.' });
      }
      
      const newOrder: Order = {
        id: uuidv4(),
        username,
        items,
        totalAmount,
        status: 'pending',
        timestamp: Date.now(),
        deliveryAddress,
      };

      ordersStore[newOrder.id] = newOrder;
      saveOrders();

      return res.status(201).json({ message: 'Заказ успешно создан.', order: newOrder });
    } catch (error) {
      return res.status(500).json({ message: `Ошибка сервера при создании заказа: ${(error as Error).message}` });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      if (!id || !status || !ordersStore[id]) {
        return res.status(400).json({ message: 'Неверные данные для обновления заказа.' });
      }

      ordersStore[id].status = status;
      saveOrders();
      return res.status(200).json({ message: 'Статус заказа обновлен.', order: ordersStore[id] });
    } catch (error) {
      return res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}