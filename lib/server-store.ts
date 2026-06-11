import fs from 'fs';
import path from 'path';

// Интерфейс для адреса пользователя
export interface Address {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // Добавьте другие поля адреса по необходимости
}

// Интерфейс для пользователя
export interface User {
  username: string;
  password: string; // В реальном приложении это должен быть хеш
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  isAdmin: boolean;
  isEmailConfirmed: boolean;
  addresses?: Address[]; // Новое поле для хранения адресов пользователя
}
// Интерфейс для товара
export interface Product {
  id: string;
  name: string;
  size: string;
  sellingPrice: number;
  purchasePrice: number;
  supplierId: string; // ID поставщика
  description: string;
  discountPrice?: number; // Цена со скидкой
  article?: string; // Добавляем поле для артикула (опционально)
  images: string[]; // Добавляем поле для изображений
  category?: string; // Добавляем поле category (опционально)
  color?: string; // Доступные цвета (через запятую)
  rating?: number; // Рейтинг
  reviews?: number; // Кол-во отзывов
}

// Интерфейс для поставщика
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  link: string; // Ссылка на ТГ или ВК (consistent with frontend)
}

// Интерфейс для заказа
export interface Order {
  id: string;
  username: string; // Имя пользователя, оформившего заказ
  items: { productId: string; name: string; quantity: number; price: number; size?: string; color?: string }[];
  totalAmount: number;
  deliveryAddress?: Address; // Добавляем адрес доставки в заказ, делаем опциональным на случай, если пользователь не выбрал
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'waiting_for_payment';
  timestamp: number;
  paymentId?: string; // ID транзакции в платежной системе
  paymentMethod?: string;
}

// Путь к файлу, где будут лежать пользователи
const USERS_FILE = path.join(process.cwd(), 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(process.cwd(), 'pending-registrations.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');
const SUPPLIERS_FILE = path.join(process.cwd(), 'suppliers.json');
const ORDERS_FILE = path.join(process.cwd(), 'orders.json');

// Загрузка пользователей из файла при старте сервера
const loadData = <T>(filePath: string): Record<string, T> => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Ошибка при загрузке данных из ${filePath}:`, error);
  }
  return {};
};

// Загрузка временных регистраций из файла при старте сервера
const saveData = <T>(filePath: string, data: Record<string, T>): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Ошибка при сохранении данных в ${filePath}:`, error);
  }
};

// Объекты с данными в памяти
export const usersStore: Record<string, User> = loadData<User>(USERS_FILE);
export const pendingRegistrations: Record<string, any> = loadData<any>(PENDING_REGISTRATIONS_FILE);
export const productsStore: Record<string, Product> = loadData<Product>(PRODUCTS_FILE);
export const suppliersStore: Record<string, Supplier> = loadData<Supplier>(SUPPLIERS_FILE);
export const ordersStore: Record<string, Order> = loadData<Order>(ORDERS_FILE);

// Функции для сохранения данных
export const saveUsers = () => saveData<User>(USERS_FILE, usersStore);
export const savePendingRegistrations = () => saveData<any>(PENDING_REGISTRATIONS_FILE, pendingRegistrations);
export const saveProducts = () => saveData<Product>(PRODUCTS_FILE, productsStore);
export const saveSuppliers = () => saveData<Supplier>(SUPPLIERS_FILE, suppliersStore);
export const saveOrders = () => saveData<Order>(ORDERS_FILE, ordersStore);

// Временные токены (можно не сохранять в файл, так как они имеют срок жизни)
export const passwordResetTokens: Record<string, { username: string; timestamp: number }> = {};

// Очистка просроченных регистраций при загрузке
for (const username in pendingRegistrations) {
  if (pendingRegistrations[username].timestamp < Date.now()) {
    delete pendingRegistrations[username];
  }
}
savePendingRegistrations(); // Сохраняем очищенные регистрации