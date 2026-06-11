'use client';

import React, { useState } from 'react';
import { Send, User, Search, MoreVertical, Phone, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string;
}

interface ChatSession {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: Message[];
}

const MOCK_CHATS: ChatSession[] = [
  {
    id: '1',
    userName: 'Анушаван Асрян',
    lastMessage: 'Когда будет доставка кроссовок?',
    time: '12:45',
    unreadCount: 2,
    messages: [
      { id: 'm1', text: 'Здравствуйте! Я сделал заказ №123.', sender: 'user', timestamp: '12:40' },
      { id: 'm2', text: 'Когда будет доставка кроссовок?', sender: 'user', timestamp: '12:45' },
    ]
  },
  {
    id: '2',
    userName: 'Иван Иванов',
    lastMessage: 'Спасибо, все подошло!',
    time: 'Вчера',
    unreadCount: 0,
    messages: [
      { id: 'm3', text: 'Здравствуйте, есть размер 42?', sender: 'user', timestamp: '10:00' },
      { id: 'm4', text: 'Да, в наличии.', sender: 'admin', timestamp: '10:05' },
      { id: 'm5', text: 'Спасибо, все подошло!', sender: 'user', timestamp: '15:20' },
    ]
  }
];

export default function AdminChatPage() {
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(MOCK_CHATS[0].id);
  const [newMessage, setNewMessage] = useState('');

  const activeChat = chats.find(c => c.id === selectedChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, messages: [...chat.messages, message], lastMessage: newMessage, time: 'Сейчас' }
        : chat
    ));
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Чат с пользователями</h1>
      
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex">
        {/* Список чатов */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск чата..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${selectedChatId === chat.id ? 'bg-indigo-50/50 border-r-4 border-indigo-500' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.userName}</h3>
                    <span className="text-[10px] text-gray-400 uppercase">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Окно сообщений */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {activeChat ? (
            <>
              <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{activeChat.userName}</h3>
                    <span className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> в сети
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 text-gray-400">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeChat.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'admin' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-100' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="p-6 bg-gray-100 rounded-full">
                <MessageSquare className="w-12 h-12" />
              </div>
              <p>Выберите чат, чтобы начать общение</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}