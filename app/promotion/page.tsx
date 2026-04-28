'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { getDirectImageUrl } from '@/lib/utils';
import { Item } from '@/types';

export default function Promotion() {
  const { items, promotionItems, t } = usePOS();
  const router = useRouter();
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

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
    // 1. Filter items based on admin settings
    let isWeighted = false;
    let availablePromoItems = items;

    if (promotionItems && promotionItems.length > 0) {
      isWeighted = true;
      availablePromoItems = items.filter(item => promotionItems.some(p => p.id === item.id));
    }
    
    // Fallback if somehow no items match the filter but shop has items
    if (availablePromoItems.length === 0 && items.length > 0) {
      availablePromoItems = items;
      isWeighted = false;
    }

    if (availablePromoItems.length === 0 || isSpinning || wonItem) return;
    
    setIsSpinning(true);
    
    // Shake for 2 seconds then "open"
    setTimeout(() => {
      setIsSpinning(false);
      setIsOpening(true);
      
      // Delay the actual reveal slightly
      setTimeout(() => {
        let randomItem = availablePromoItems[0];

        if (isWeighted) {
          const totalWeight = promotionItems.reduce((sum, p) => sum + p.weight, 0);
          let random = Math.random() * totalWeight;
          for (const p of promotionItems) {
            if (random < p.weight) {
              randomItem = items.find(i => i.id === p.id) || availablePromoItems[0];
              break;
            }
            random -= p.weight;
          }
        } else {
          const randomIndex = Math.floor(Math.random() * availablePromoItems.length);
          randomItem = availablePromoItems[randomIndex];
        }
        
        setWonItem(randomItem);
        setIsOpening(false);
        
        sessionStorage.setItem('promotion_item_id', randomItem.id.toString());
        sessionStorage.setItem('promotion_claimed', 'true');
      }, 500);
    }, 2000);
  };

  const handleContinue = () => {
    router.push('/checkout');
  };

  return (
    <main style={{ maxWidth: '600px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
        {t('promotion_title')}
      </h1>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--secondary)' }}>
        {t('promotion_desc')}
      </p>

      {!wonItem && (
        <div 
          className={`mystery-box ${isSpinning ? 'spinning' : ''} ${isOpening ? 'opening' : ''}`}
          onClick={handleRandomize}
        >
          {isSpinning ? '?' : 'สุ่มเลย!!!'}
        </div>
      )}

      {wonItem && (
        <div className="card" style={{ animation: 'itemReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>🎉 {t('congrats')}!</h2>
          
          <div style={{ 
            height: '220px', 
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            marginBottom: '1rem',
            border: '4px solid var(--primary)',
            boxShadow: '0 0 20px rgba(251, 146, 60, 0.3)'
          }}>
            <img 
              src={getDirectImageUrl(wonItem.photo)} 
              alt={wonItem.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{wonItem.name}</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
            {t('free')}! (฿0)
          </p>

          <button className="btn-primary w-full" style={{ padding: '1rem' }} onClick={handleContinue}>
            {t('continue_checkout')}
          </button>
        </div>
      )}
    </main>
  );
}
