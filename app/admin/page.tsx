'use client';

import { usePOS } from '@/context/POSContext';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const { orders, updateOrderStatus, t, orderMetadata, toggleOrderReceived } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => 
    order.customer.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col-mobile justify-between items-center gap-4">
          <h1 style={{ marginBottom: 0 }}>Incoming Orders</h1>
          <div className="flex gap-2">
            <Link href="/admin/summary" className="btn-outline">
              View Summary
            </Link>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search customer nickname..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.8rem 1rem 0.8rem 2.8rem', 
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--secondary)' }}>
            {searchTerm ? `No orders found for "${searchTerm}"` : 'No orders yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => {
            const isReceived = orderMetadata[order.id]?.received || false;
            return (
              <div 
                key={order.id} 
                className="card flex flex-col-mobile justify-between items-center gap-4 transition-all duration-300"
                style={{ 
                  background: isReceived ? '#f0fdf4' : 'var(--card-bg)',
                  borderColor: isReceived ? '#bbf7d0' : 'var(--border)',
                  boxShadow: isReceived ? '0 4px 12px rgba(22, 163, 74, 0.1)' : 'var(--shadow)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ marginBottom: 0 }}>Order {order.id}</h3>
                    {isReceived && (
                      <span style={{ 
                        background: '#10b981', 
                        color: 'white', 
                        fontSize: '0.6rem', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '20px',
                        fontWeight: '800'
                      }}>
                        RECEIVED
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: isReceived ? '#166534' : 'var(--secondary)' }}>
                    Customer: <strong>{order.customer.nickname}</strong> ({order.customer.contact}) | ฿{order.total}
                  </p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: isReceived ? '#15803d' : 'inherit' }}>
                    Status: <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{order.status}</span>
                  </p>
                </div>

                <div className="flex flex-col-mobile items-center gap-4">
                  {order.status.toLowerCase() === 'completed' && (
                    <div 
                      className="flex items-center gap-2 px-2 py-2 rounded-full cursor-pointer transition-all duration-300" 
                      onClick={() => toggleOrderReceived(order.id, !isReceived)}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isReceived ? 'none' : '2px solid #cbd5e1',
                        background: isReceived ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}>
                        {isReceived && (
                          <svg width="10" height="8" viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        color: isReceived ? '#10b981' : '#94a3b8',
                        letterSpacing: '0.025em'
                      }}>
                        {isReceived ? 'RECEIVED' : 'MARK RECEIVED'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        className="btn-primary"
                        onClick={() => updateOrderStatus(order.id, 'awaiting_payment')}
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status.toLowerCase() === 'paid_awaiting_approval' && (
                      <button
                        className="btn-primary"
                        style={{ background: '#10b981' }}
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Mark as Paid
                      </button>
                    )}
                    {order.status.toLowerCase() === 'awaiting_payment' && order.paymentOption === 'later' && (
                      <button
                        className="btn-primary"
                        style={{ background: '#10b981' }}
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Mark as Paid (Cash)
                      </button>
                    )}
                    <Link href={`/admin/orders/${order.id}`} className="btn-outline" style={{ padding: '0.5rem 1rem', background: isReceived ? 'white' : 'transparent' }}>
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}
    </div>
  );
}

