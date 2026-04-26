'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { getDirectImageUrl } from '@/lib/utils';
import { Customer } from '@/types';

export default function Menu() {
  const { items, shop, t, language } = usePOS();
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const info = sessionStorage.getItem('customer_info');
    if (!info) {
      router.push('/');
    } else {
      setCustomer(JSON.parse(info));
    }
  }, [router]);

  const updateCart = (itemId: number, delta: number) => {
    const item = items.find(it => it.id === itemId);
    if (!item) return;

    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      if (delta > 0 && currentQty >= item.stock) return prev;

      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find(it => it.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = () => {
    sessionStorage.setItem('cart', JSON.stringify(cart));
    if (totalPrice >= 50 && sessionStorage.getItem('promotion_claimed') !== 'true') {
      router.push('/promotion');
    } else {
      router.push('/checkout');
    }
  };

  if (!customer) return null;

  return (
    <main style={{ paddingBottom: cartCount > 0 ? '6rem' : '0' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1>{language === 'th' ? `ยินดีต้อนรับ, ${customer.nickname}!` : `Welcome, ${customer.nickname}!`}</h1>
          <p style={{ color: 'var(--secondary)' }}>
            {language === 'th' ? `เลือกสินค้าที่ต้องการสั่งจากร้าน ${shop.name}` : `Select items you want to order from ${shop.name}`}
          </p>
        </div>
        {cartCount > 0 && (
          <div className="card" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white' }}>
            {cartCount} {t('items')} | ฿{totalPrice}
          </div>
        )}
      </header>

      {/* Promotion Banner */}
      <div className="card mb-6" style={{ 
        background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)', 
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
        animation: 'scaleUp 0.5s ease-out'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{t('promotion_title')}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{t('promotion_desc')}</p>
        </div>
      </div>

      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="card flex flex-col" style={{ opacity: item.stock > 0 ? 1 : 0.7 }}>
            <div style={{ 
              height: '200px', 
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <img 
                src={getDirectImageUrl(item.photo)} 
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h3>{item.name}</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', flex: 1 }}>{item.description}</p>
            
            <p style={{ 
              color: item.stock > 0 ? 'var(--secondary)' : '#ef4444', 
              fontSize: '0.85rem', 
              fontWeight: '600',
              marginTop: '0.5rem'
            }}>
              {item.stock > 0 ? `${t('available')}: ${item.stock}` : t('out_of_stock')}
            </p>

            <div className="flex justify-between items-center mt-4">
              <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>฿{item.price}</span>
              <div className="flex items-center gap-2">
                <button 
                  className="btn-outline" 
                  style={{ padding: '0.25rem 0.75rem' }}
                  onClick={() => updateCart(item.id, -1)}
                  disabled={!cart[item.id]}
                >
                  -
                </button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{cart[item.id] || 0}</span>
                <button 
                  className="btn-outline" 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    opacity: (cart[item.id] || 0) >= item.stock ? 0.5 : 1,
                    cursor: (cart[item.id] || 0) >= item.stock ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => updateCart(item.id, 1)}
                  disabled={(cart[item.id] || 0) >= item.stock || item.stock === 0}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '600px'
        }}>
          <button className="btn-primary w-full" onClick={handleCheckout}>
            {t('checkout')} (฿{totalPrice})
          </button>
        </div>
      )}
    </main>
  );
}
