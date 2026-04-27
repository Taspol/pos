'use client';

import { usePOS } from '@/context/POSContext';
import Link from 'next/link';

export default function AdminOrders() {
  const { orders, updateOrderStatus, t } = usePOS();

  return (
    <div>
      <div className="flex flex-col-mobile justify-between items-center mb-20 gap-4">
        <h1 style={{ marginBottom: 0 }}>Incoming Orders</h1>
        <div className="flex gap-2">
          <Link href="/admin/summary" className="btn-outline">
            View Summary
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--secondary)' }}>No orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="card flex flex-col-mobile justify-between items-center">
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Order {order.id}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                  Customer: <strong>{order.customer.nickname}</strong> ({order.customer.contact}) | ฿{order.total}
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Status: <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{order.status}</span>
                </p>
              </div>

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
                <Link href={`/admin/orders/${order.id}`} className="">
                  Details / Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
