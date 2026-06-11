'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastMessage(message);
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setToastMessage(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isVisible && toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[1000] transition-all duration-300 animate-fade-in-up backdrop-blur-md">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};