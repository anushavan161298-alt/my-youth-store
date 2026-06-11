import type { NextApiRequest, NextApiResponse } from 'next';
import { productsStore, saveProducts, Product } from '../../lib/server-store';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query; // Проверяем, есть ли ID в запросе
      if (id) {
        // Если ID есть, возвращаем конкретный товар
        const product = productsStore[id as string];
        if (product) {
          return res.status(200).json(product);
        } else {
          return res.status(404).json({ message: 'Товар не найден.' });
        }
      } else {
        // Если ID нет, возвращаем все товары
        return res.status(200).json(productsStore);
      }
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      return res.status(500).json({ message: 'Ошибка сервера при получении товаров.' });
    }
  } else if (req.method === 'POST') {
    try {
      const productData = req.body;
      if (!productData.name || !productData.supplierId || productData.sellingPrice === undefined) {
        return res.status(400).json({ message: 'Не все обязательные поля товара (имя, поставщик, цена) заполнены.' });
      }

      const newProduct: Product = { 
        ...productData, 
        id: uuidv4(),
        images: Array.isArray(productData.images) ? productData.images : [] 
      };

      productsStore[newProduct.id] = newProduct;
      saveProducts();
      return res.status(201).json({ message: 'Товар успешно добавлен.', product: newProduct });
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      return res.status(500).json({ message: `Ошибка сервера при добавлении товара: ${(error as Error).message}` });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const productData = req.body;
      if (!id || !productsStore[id as string]) {
        return res.status(404).json({ message: 'Товар не найден.' });
      }

      const updatedProduct: Product = { 
        ...productsStore[id as string],
        ...productData,
        images: Array.isArray(productData.images) ? productData.images : (productsStore[id as string].images || [])
      };

      productsStore[id as string] = updatedProduct;
      saveProducts();
      return res.status(200).json({ message: 'Товар успешно обновлен.', product: updatedProduct });
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      return res.status(500).json({ message: `Ошибка сервера при обновлении товара: ${(error as Error).message}` });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || !productsStore[id as string]) {
        return res.status(404).json({ message: 'Товар не найден.' });
      }
      delete productsStore[id as string];
      saveProducts();
      return res.status(200).json({ message: 'Товар успешно удален.' });
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      return res.status(500).json({ message: `Ошибка сервера при удалении товара: ${(error as Error).message}` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}