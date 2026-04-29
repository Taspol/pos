'use client';

import { usePOS } from '@/context/POSContext';
import Link from 'next/link';

export default function AdminSummary() {
  const { orders, items, t, orderMetadata } = usePOS();

  // Basic Stats
  const totalOrders = orders.length;
  const completedOrdersList = orders.filter(o => o.status === 'completed');
  const completedOrders = completedOrdersList.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);

  // Received Stats
  const receivedOrdersList = completedOrdersList.filter(o => orderMetadata[o.id]?.received);
  const receivedOrders = receivedOrdersList.length;
  const receivedRevenue = receivedOrdersList.reduce((sum, ord) => sum + ord.total, 0);
  const receivedWeight = totalOrders > 0 ? (receivedOrders / totalOrders) * 100 : 0;
  
  // Calculate Items Sold and Revenue per item
  const itemStats = items.map(item => {
    let soldCount = 0;
    let itemRevenue = 0;
    
    orders.forEach(order => {
      const orderItem = order.items.find(oi => oi.id === item.id);
      if (orderItem) {
        soldCount += orderItem.quantity;
        itemRevenue += orderItem.quantity * orderItem.price;
      }
    });
    
    return {
      ...item,
      soldCount,
      itemRevenue
    };
  }).sort((a, b) => b.soldCount - a.soldCount);

  const topSellers = itemStats.slice(0, 5).filter(s => s.soldCount > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col-mobile justify-between items-center gap-4">
        <h1 style={{ marginBottom: 0 }}>Sales Summary</h1>
      </div>

      {/* Main Stats Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--foreground)' }}>
            ฿{totalRevenue.toLocaleString()}
          </h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>From {totalOrders} total orders</p>
        </div>

        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Status</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#10b981' }}>
            {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
          </h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{completedOrders} completed payments</p>
        </div>

        <div className="card" style={{ border: '2px solid #10b981', background: '#f0fdf4' }}>
          <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Received Revenue</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#166534' }}>
            ฿{receivedRevenue.toLocaleString()}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#15803d' }}>From {receivedOrders} verified items</p>
        </div>

        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Order</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--foreground)' }}>
            ฿{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
          </h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Per transaction</p>
        </div>
      </div>

      <div className="responsive-grid">
        {/* Top Sellers Table */}
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Top Selling Items</h3>
          {topSellers.length === 0 ? (
            <p style={{ color: 'var(--secondary)', textAlign: 'center', padding: '2rem' }}>No items sold yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topSellers.map((item, idx) => (
                <div key={item.id} className="flex justify-between items-center py-2" style={{ borderBottom: idx < topSellers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 600, color: 'var(--secondary)', width: '20px', fontSize: '0.9rem' }}>{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{item.soldCount} units</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>฿{item.itemRevenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Status */}
        <div className="card" style={{ border: '1px solid var(--border)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Stock Status</h3>
          <div className="flex flex-col gap-3">
            {items.filter(it => it.stock < 10).slice(0, 5).map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                <span style={{ 
                  padding: '0.1rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: item.stock === 0 ? '#ef4444' : '#64748b',
                  border: '1px solid var(--border)'
                }}>
                  {item.stock} LEFT
                </span>
              </div>
            ))}
            {items.filter(it => it.stock < 10).length === 0 && (
              <p style={{ color: 'var(--secondary)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>Stock levels healthy</p>
            )}
            <Link href="/admin/items" className="btn-outline w-full mt-4" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              Inventory Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
