import type { NextApiRequest, NextApiResponse } from 'next';
import { suppliersStore, saveSuppliers, Supplier } from '../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      return res.status(200).json(suppliersStore);
    } catch (error) {
      console.error('Ошибка при получении поставщиков:', error);
      return res.status(500).json({ message: 'Ошибка сервера при получении поставщиков.' });
    }
  } else if (req.method === 'POST') {
    try {
      const newSupplier: Supplier = { ...req.body, id: uuidv4() };
      if (!newSupplier.name || !newSupplier.phone) { // Email не обязателен, но телефон или имя - да
        return res.status(400).json({ message: 'Имя и телефон поставщика обязательны.' });
      }
      suppliersStore[newSupplier.id] = newSupplier;
      saveSuppliers();
      return res.status(201).json({ message: 'Поставщик успешно добавлен.', supplier: newSupplier });
    } catch (error) {
      console.error('Ошибка при добавлении поставщика:', error);
      return res.status(500).json({ message: `Ошибка сервера при добавлении поставщика: ${(error as Error).message}` });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updatedSupplier: Supplier = req.body;
      if (!id || !suppliersStore[id as string]) {
        return res.status(404).json({ message: 'Поставщик не найден.' });
      }
      if (!updatedSupplier.name || !updatedSupplier.phone) {
        return res.status(400).json({ message: 'Имя и телефон поставщика обязательны.' });
      }
      suppliersStore[id as string] = { ...suppliersStore[id as string], ...updatedSupplier };
      saveSuppliers();
      return res.status(200).json({ message: 'Поставщик успешно обновлен.', supplier: suppliersStore[id as string] });
    } catch (error) {
      console.error('Ошибка при обновлении поставщика:', error);
      return res.status(500).json({ message: `Ошибка сервера при обновлении поставщика: ${(error as Error).message}` });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || !suppliersStore[id as string]) {
        return res.status(404).json({ message: 'Поставщик не найден.' });
      }
      delete suppliersStore[id as string];
      saveSuppliers();
      return res.status(200).json({ message: 'Поставщик успешно удален.' });
    } catch (error) {
      console.error('Ошибка при удалении поставщика:', error);
      return res.status(500).json({ message: `Ошибка сервера при удалении поставщика: ${(error as Error).message}` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}