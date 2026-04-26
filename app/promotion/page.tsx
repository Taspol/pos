'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { getDirectImageUrl } from '@/lib/utils';
import { Item } from '@/types';

export default function Promotion() {
  const { items, t } = usePOS();
  const router = useRouter();
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    // Check if they came here legally (cart exists, total >= 50)
    const cartInfo = sessionStorage.getItem('cart');
    if (!cartInfo) {
      router.push('/');
      return;
    }
    
    // Check if already claimed
    if (sessionStorage.getItem('promotion_claimed') === 'true') {
      router.push('/checkout');
    }
  }, [router]);

  const handleRandomize = () => {
    if (items.length === 0) return;
    
    setIsSpinning(true);
    
    // Simulate a "spinning" or "calculating" effect
    setTimeout(() => {
      // Pick a random item from the list
      const randomIndex = Math.floor(Math.random() * items.length);
      const randomItem = items[randomIndex];
      
      setWonItem(randomItem);
      setIsSpinning(false);
      
      // Save the promotion data
      sessionStorage.setItem('promotion_item_id', randomItem.id.toString());
      sessionStorage.setItem('promotion_claimed', 'true');
    }, 1500);
  };

  const handleContinue = () => {
    router.push('/checkout');
  };

  return (
    <main style={{ maxWidth: '600px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)', animation: 'bounce 2s infinite' }}>
        {t('promotion_title')}
      </h1>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--secondary)' }}>
        {t('promotion_desc')}
      </p>

      {!wonItem && (
        <button 
          className="btn-primary" 
          style={{ fontSize: '1.5rem', padding: '1rem 2rem', borderRadius: '50px', transform: isSpinning ? 'scale(0.95)' : 'scale(1)', opacity: isSpinning ? 0.7 : 1, transition: 'all 0.2s' }}
          onClick={handleRandomize}
          disabled={isSpinning || items.length === 0}
        >
          {isSpinning ? '...' : t('random_btn')}
        </button>
      )}

      {wonItem && (
        <div className="card" style={{ animation: 'scaleUp 0.5s ease-out', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>{t('congrats')}</h2>
          
          <div style={{ 
            height: '200px', 
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginBottom: '1rem',
            border: '4px solid var(--primary)'
          }}>
            <img 
              src={getDirectImageUrl(wonItem.photo)} 
              alt={wonItem.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{wonItem.name}</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            {t('free')}! (฿0)
          </p>

          <button className="btn-primary w-full" onClick={handleContinue}>
            {t('continue_checkout')}
          </button>
        </div>
      )}
    </main>
  );
}
