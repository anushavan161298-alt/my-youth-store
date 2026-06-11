'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ВНИМАНИЕ: Это клиентская аутентификация, НЕБЕЗОПАСНА для реальных приложений.
// Пароли и данные пользователя должны храниться и обрабатываться на сервере.

interface User {
  username: string;
  isAdmin: boolean;
  firstName?: string;
  lastName?: string;
  birthDate?: string; // Изменили с года (number) на полную дату (string)
  email?: string;
  isEmailConfirmed?: boolean; // Для симуляции подтверждения почты
}

interface UserContextType {
  user: User | null;
  isHydrated: boolean;
  // login: (username: string, password: string) => boolean; // Removed as API handles login
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  React.useEffect(() => {
    // Загрузка состояния пользователя из localStorage при инициализации
    const savedUser = localStorage.getItem('youth-store-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem('youth-store-user');
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Сохранение состояния пользователя в localStorage при изменении
    if (isHydrated) {
      if (user) {
        localStorage.setItem('youth-store-user', JSON.stringify(user));
      } else {
        localStorage.removeItem('youth-store-user');
      }
    }
  }, [user, isHydrated]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('youth-store-user'); // Удаляем пользователя из localStorage при выходе
    console.log('Пользователь вышел из системы.');
  };

  return (
    <UserContext.Provider value={{ user, isHydrated, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}