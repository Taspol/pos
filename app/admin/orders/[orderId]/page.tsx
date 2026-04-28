'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Order, OrderStatus } from '@/types';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: '#eee', borderRadius: 'var(--radius)' }}>Loading Map...</div>
});

export default function AdminOrderDetails() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { items, orders, messages, addMessage, updateOrderStatus, deleteOrder, updateOrderFreeItem, t, fetchMessagesForOrder } = usePOS();
  const [order, setOrder] = useState<Order | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isUpdatingFree, setIsUpdatingFree] = useState(false);

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

  if (!order) return <div>Loading order details...</div>;

  const orderMessages = messages.filter(m => m.orderId === orderId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addMessage(orderId, 'admin', chatInput);
    setChatInput('');
  };

  const handleChangeFreeItem = async (newItemId: number) => {
    if (confirm('Change the free item for this order?')) {
      setIsUpdatingFree(true);
      try {
        await updateOrderFreeItem(order.id, newItemId);
      } catch (err) {
        alert('Failed to update free item');
      } finally {
        setIsUpdatingFree(false);
      }
    }
  };

  return (
    <div>
      <h1 className="mb-4">Order Details: {order.id}</h1>
      
      <div className="responsive-grid">
        <div className="flex flex-col gap-4">
          <div className="card">
            <h3>Customer Info</h3>
            <p><strong>Nickname:</strong> {order.customer.nickname}</p>
            <p><strong>Contact:</strong> {order.customer.contact}</p>
            <p><strong>Receive Method:</strong> {order.receiveMethod === 'delivery' ? 'Delivery' : 'Pick up'}</p>
            <p><strong>Payment Option:</strong> {order.paymentOption === 'now' ? 'Pay Now' : 'Pay After Receive'}</p>
            <p><strong>Status:</strong> {order.status}</p>
            
            <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>
              {order.status.toLowerCase() === 'pending' && (
                <button className="btn-primary" onClick={() => updateOrderStatus(orderId, 'awaiting_payment')}>{t('accept')}</button>
              )}
              {order.status.toLowerCase() === 'awaiting_payment' && (
                <button className="btn-primary" onClick={() => updateOrderStatus(orderId, 'paid_awaiting_approval')}>{t('confirm_payment')} (Sim)</button>
              )}
              {order.status.toLowerCase() === 'paid_awaiting_approval' && (
                <button className="btn-primary" onClick={() => updateOrderStatus(orderId, 'completed')}>{t('confirm_payment')}</button>
              )}
              <button 
                className="btn-outline" 
                style={{ borderColor: 'red', color: 'red' }} 
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this order?')) {
                    await deleteOrder(orderId);
                    window.location.href = '/admin';
                  }
                }}
              >
                Delete Order
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Items</h3>
            {order.items.map((item, idx) => {
              const isFree = item.price === 0;
              return (
                <div key={idx} className="flex justify-between items-start mb-3">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.name} x {item.quantity}</div>
                    {isFree && (
                      <div className="mt-1">
                        <label style={{ fontSize: '0.75rem', display: 'block', color: 'var(--secondary)' }}>🎁 Edit Free Item:</label>
                        <select 
                          className="w-full" 
                          style={{ fontSize: '0.85rem', padding: '0.4rem', marginTop: '0.2rem' }}
                          disabled={isUpdatingFree}
                          value={item.id}
                          onChange={(e) => handleChangeFreeItem(parseInt(e.target.value))}
                        >
                          {items.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.name} (Stock: {it.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <span style={{ marginLeft: '1rem' }}>฿{item.price * item.quantity}</span>
                </div>
              );
            })}
            <hr className="my-2" style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <div className="flex justify-between font-bold" style={{ fontWeight: 700 }}>
              <span>Total</span>
              <span>฿{order.total}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {order.receiveMethod === 'delivery' && (
            <div className="card">
              <h3>Delivery Location</h3>
              <p style={{ marginBottom: '1rem' }}><strong>Address Details:</strong> {order.locationDetail || 'No details provided'}</p>
              {order.lat && order.lng && (
                <LocationPicker 
                  onLocationSelect={() => {}} 
                  initialPos={[order.lat, order.lng]} 
                />
              )}
            </div>
          )}

          {order.slipPath && (
            <div className="card">
              <h3>Payment Slip</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Click image to view full size</p>
              <a href={order.slipPath} target="_blank" rel="noopener noreferrer">
                <img 
                  src={order.slipPath} 
                  alt="Payment Slip" 
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} 
                />
              </a>
            </div>
          )}

          <div className="card flex flex-col" style={{ height: '500px' }}>
          <h3>Chat with Customer</h3>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orderMessages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'admin' ? 'var(--primary)' : 'var(--border)',
                  color: msg.sender === 'admin' ? 'white' : 'var(--foreground)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  maxWidth: '80%'
                }}
              >
                {msg.text}
              </div>
            ))}
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
      </div>
    </div>
  </div>
);
}
