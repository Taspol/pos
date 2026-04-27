'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Shop, Item, Order, Message, POSContextType, OrderStatus } from '@/types';
import { getShop, updateShop as apiUpdateShop } from '@/app/actions/shop';
import { getItems, addItem as apiAddItem, updateItem as apiUpdateItem } from '@/app/actions/items';
import { getOrders, createOrder as apiCreateOrder, updateOrderStatus as apiUpdateStatus, deleteOrder as apiDeleteOrder } from '@/app/actions/orders';
import { getMessages, addMessage as apiAddMessage } from '@/app/actions/messages';
import { translations, TranslationKey } from '@/lib/translations';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

interface POSProviderProps {
  children: ReactNode;
}

export const POSProvider = ({ children }: POSProviderProps) => {
  const [shop, setShop] = useState<Shop>({
    name: 'กำลังโหลด...',
    details: 'กำลังเชื่อมต่อฐานข้อมูล...'
  });
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<'en' | 'th'>('th');

  const t = useCallback((key: string): string => {
    return (translations[language] as any)[key] || key;
  }, [language]);

  // Function to refresh all data from DB
  const refreshData = useCallback(async () => {
    try {
      const [shopData, itemsData, ordersData] = await Promise.all([
        getShop(),
        getItems(),
        getOrders()
      ]);
      setShop(shopData as Shop);
      setItems(itemsData as Item[]);
      setOrders(ordersData as Order[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  // Initial fetch and polling for sync
  useEffect(() => {
    refreshData();
    
    // Polling every 5 seconds for "real-time" sync across browsers
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const updateShop = async (newShop: Shop) => {
    setShop(newShop);
    await apiUpdateShop(newShop);
  };

  const addItem = async (item: Omit<Item, 'id'>) => {
    const newItem = await apiAddItem(item);
    setItems(prev => [newItem as unknown as Item, ...prev]);
  };

  const updateItem = async (id: number, item: Omit<Item, 'id'>) => {
    await apiUpdateItem(id, item);
    await refreshData();
  };

  const addOrder = async (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
    const orderId = await apiCreateOrder(order);
    await refreshData(); // Force sync
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
    await apiUpdateStatus(orderId, status);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== orderId));
    await apiDeleteOrder(orderId);
  };

  const addMessage = async (orderId: string, sender: 'customer' | 'admin', text: string) => {
    const newMessage = await apiAddMessage(orderId, sender, text);
    setMessages(prev => [...prev, {
      ...newMessage,
      sender: newMessage.sender.toLowerCase() as 'customer' | 'admin',
      timestamp: newMessage.createdAt.toISOString()
    }]);
  };

  // Sync messages separately for the active order
  const fetchMessagesForOrder = useCallback(async (orderId: string) => {
    const msgs = await getMessages(orderId);
    setMessages(msgs.map(m => ({
      ...m,
      sender: m.sender.toLowerCase() as 'customer' | 'admin',
      timestamp: m.createdAt.toISOString()
    })));
  }, []);

  return (
    <POSContext.Provider value={{
      shop,
      updateShop,
      items,
      addItem,
      updateItem,
      orders,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      messages,
      addMessage,
      language,
      setLanguage,
      t,
      fetchMessagesForOrder,
      updateOrderFreeItem: async (orderId: string, newItemId: number) => {
        const { updateOrderFreeItem: apiUpdateFreeItem } = await import('@/app/actions/orders');
        await apiUpdateFreeItem(orderId, newItemId);
        await refreshData();
      }
    }}>
      {children}
    </POSContext.Provider>
  );
};
