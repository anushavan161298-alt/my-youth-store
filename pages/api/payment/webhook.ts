import type { NextApiRequest, NextApiResponse } from 'next';
import { ordersStore, saveOrders } from '../../../lib/server-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const event = req.body;

  // Проверяем только успешную оплату
  if (event.event === 'payment.succeeded') {
    const paymentId = event.object.id;
    
    // Ищем заказ по paymentId
    const orderId = Object.keys(ordersStore).find(
      id => ordersStore[id].paymentId === paymentId
    );

    if (orderId) {
      // Обновляем статус на "оплачено/в обработке"
      ordersStore[orderId].status = 'processing';
      saveOrders();
      console.log(`Order ${orderId} marked as PAID`);
    }
  }

  // Всегда отвечаем 200, чтобы ЮKassa не повторяла запрос
  res.status(200).json({ status: 'ok' });
}