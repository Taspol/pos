'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Order } from '@/types';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: '#eee', borderRadius: 'var(--radius)' }}>Loading Map...</div>
});

export default function OrderDetails() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { orders, messages, addMessage, fetchMessagesForOrder } = usePOS();
  const [order, setOrder] = useState<Order | null>(null);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const foundOrder = orders.find(ord => ord.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [orders, orderId]);

  // Sync messages
  useEffect(() => {
    fetchMessagesForOrder(orderId);
    const interval = setInterval(() => {
      fetchMessagesForOrder(orderId);
    }, 3000); // Sync every 3 seconds
    return () => clearInterval(interval);
  }, [orderId, fetchMessagesForOrder]);

  if (!order) return <main>Loading order details...</main>;

  const orderMessages = messages.filter(m => m.orderId === orderId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addMessage(orderId, 'customer', chatInput);
    setChatInput('');
  };

  return (
    <main className="responsive-grid">
      <div className="card">
        <h1>Order {order.id}</h1>
        <p className={`status-${order.status}`} style={{ 
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          background: order.status === 'completed' ? '#dcfce7' : '#fef9c3',
          color: order.status === 'completed' ? '#166534' : '#854d0e',
          fontSize: '0.8rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          {order.status}
        </p>

        <div className="mb-4">
          <h3 style={{ fontSize: '1rem' }}>Items</h3>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>฿{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', fontWeight: '700' }}>
            <span>Total</span>
            <span>฿{order.total}</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem' }}>Customer Info</h3>
          <p style={{ fontSize: '0.9rem' }}>Name: {order.customer.nickname}</p>
          <p style={{ fontSize: '0.9rem' }}>Contact: {order.customer.contact}</p>
          <p style={{ fontSize: '0.9rem' }}>Receive Method: {order.receiveMethod === 'delivery' ? 'Delivery' : 'Pick up'}</p>
          <p style={{ fontSize: '0.9rem' }}>Payment Option: {order.paymentOption === 'now' ? 'Pay Now' : 'Pay After Receive'}</p>
          {order.receiveMethod === 'delivery' && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem' }}>Delivery Location</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Details:</strong> {order.locationDetail}</p>
              {order.lat && order.lng && (
                <LocationPicker onLocationSelect={() => {}} initialPos={[order.lat, order.lng]} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card flex flex-col" style={{ height: '500px' }}>
        <h3>Chat with Admin</h3>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orderMessages.length === 0 ? (
            <p style={{ color: 'var(--secondary)', textAlign: 'center', marginTop: '2rem' }}>No messages yet. Say hi!</p>
          ) : (
            orderMessages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'customer' ? 'var(--primary)' : 'var(--border)',
                  color: msg.sender === 'customer' ? 'white' : 'var(--foreground)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  maxWidth: '80%'
                }}
              >
                {msg.text}
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <button type="submit" className="btn-primary">Send</button>
        </form>
      </div>
    </main>
  );
}
