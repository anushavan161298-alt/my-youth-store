import type { NextApiRequest, NextApiResponse } from 'next';
import { ordersStore, saveOrders, Order } from '../../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

// Данные должны браться из переменных окружения для безопасности
const SHOP_ID = process.env.YOOKASSA_SHOP_ID; 
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!SHOP_ID || !SECRET_KEY || SHOP_ID === 'YOUR_SHOP_ID') {
    return res.status(500).json({ message: 'Критическая ошибка: SHOP_ID или SECRET_KEY не настроены в .env.local' });
  }

  try {
    const { orderData } = req.body;
    const orderId = uuidv4();
    const idempotenceKey = orderId; // Используем ID заказа для предотвращения дублей

    // 1. Формируем запрос к ЮKassa
    const yooKassaRequest = {
      amount: {
        value: orderData.totalAmount.toFixed(2),
        currency: 'RUB',
      },
      capture: true, // Автоматическое списание
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders`,
      },
      description: `Оплата заказа #${orderId} в YOUTH STORE`,
      metadata: { orderId },
      payment_method_data: {
        type: orderData.paymentMethod === 'sbp' ? 'sbp' : 'bank_card',
      }
    };

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yooKassaRequest),
    });

    const payment = await response.json();

    if (!response.ok) {
      throw new Error(payment.description || 'Ошибка ЮKassa');
    }

    // 2. Сохраняем заказ со статусом "ожидает оплаты"
    const newOrder: Order = {
      id: orderId,
      username: orderData.username,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      status: 'waiting_for_payment',
      timestamp: Date.now(),
      paymentId: payment.id, // Сохраняем ID платежа для Webhook
      paymentMethod: orderData.paymentMethod,
    };

    ordersStore[orderId] = newOrder;
    saveOrders();

    // 3. Возвращаем ссылку на оплату
    return res.status(200).json({
      confirmationUrl: payment.confirmation.confirmation_url,
      orderId: orderId
    });

  } catch (error: any) {
    console.error('Payment error:', error);
    return res.status(500).json({ message: error.message });
  }
}