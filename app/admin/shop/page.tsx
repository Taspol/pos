'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { Shop } from '@/types';
import { getDirectImageUrl } from '@/lib/utils';

export default function AdminShop() {
  const { shop, updateShop, items, promotionItems, updatePromotionItems } = usePOS();
  const [formData, setFormData] = useState<Shop>({ ...shop });
  const [selectedPromoItems, setSelectedPromoItems] = useState<{id: number, weight: number}[]>(promotionItems || []);
  const [saved, setSaved] = useState(false);
  const [promoSaved, setPromoSaved] = useState(false);

  const [isPromoInitialized, setIsPromoInitialized] = useState(false);
  const [isShopInitialized, setIsShopInitialized] = useState(false);

  useEffect(() => {
    const isDataLoaded = shop && shop.name !== 'กำลังโหลด...';
    
    if (isDataLoaded && !isPromoInitialized) {
      setSelectedPromoItems(promotionItems);
      setIsPromoInitialized(true);
    }
    if (isDataLoaded && !isShopInitialized) {
      setFormData(shop);
      setIsShopInitialized(true);
    }
  }, [promotionItems, shop, isPromoInitialized, isShopInitialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePromo = () => {
    updatePromotionItems(selectedPromoItems);
    setPromoSaved(true);
    setTimeout(() => setPromoSaved(false), 3000);
  };

  const togglePromoItem = (id: number) => {
    setSelectedPromoItems(prev =>
      prev.find(i => i.id === id)
        ? prev.filter(i => i.id !== id)
        : [...prev, { id, weight: 1 }]
    );
  };

  const updateWeight = (id: number, val: string) => {
    setSelectedPromoItems(prev =>
      prev.map(i => i.id === id ? { ...i, weight: val === '' ? 0 : parseInt(val) } : i)
    );
  };

  const isSelected = (id: number) => selectedPromoItems.some(i => i.id === id);
  const getWeight = (id: number) => selectedPromoItems.find(i => i.id === id)?.weight || 1;
  const totalWeight = selectedPromoItems.length > 0 
    ? selectedPromoItems.reduce((sum, item) => sum + (item.weight || 1), 0)
    : items.length;

  const getChance = (id: number) => {
    if (selectedPromoItems.length === 0) return Math.round((1 / items.length) * 100);
    const weight = getWeight(id) || 1;
    return isSelected(id) ? Math.round((weight / totalWeight) * 100) : 0;
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="mb-4">Shop Settings</h1>

      <div className="card mb-6">
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Basic Info</h2>
          <label className="block mb-2 font-bold">Shop Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <label className="block mb-2 font-bold">Shop Details / Description</label>
          <textarea
            rows={5}
            value={formData.details}
            onChange={e => setFormData({ ...formData, details: e.target.value })}
            required
          />

          <button type="submit" className="btn-primary w-full mt-4">
            Save Shop Info
          </button>

          {saved && (
            <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem', fontWeight: '600' }}>
              ✓ Shop info saved successfully!
            </p>
          )}
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Random Promotion Items</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          Select items and adjust their "Weight" to control how often they are given away. Higher weight = higher chance. If no items are selected, all items have an equal chance.
        </p>

        <div className="flex flex-col gap-2 mb-4" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              className="flex items-center gap-4" 
              onClick={() => togglePromoItem(item.id)}
              style={{ 
                padding: '1rem', 
                border: isSelected(item.id) ? '2px solid var(--primary)' : '1px solid var(--border)', 
                borderRadius: 'var(--radius)', 
                cursor: 'pointer', 
                background: isSelected(item.id) ? 'var(--accent)' : 'transparent', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                flexWrap: 'wrap'
              }}
            >
              <div className="flex items-center gap-3" style={{ flex: '1 1 min-content' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  border: isSelected(item.id) ? 'none' : '2px solid #cbd5e1',
                  background: isSelected(item.id) ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected(item.id) ? '0 4px 10px rgba(251, 146, 60, 0.3)' : 'none'
                }}>
                  {isSelected(item.id) && (
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <img src={getDirectImageUrl(item.photo)} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontWeight: '600', fontSize: '1.05rem', wordBreak: 'break-word' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Stock: {item.stock} | ฿{item.price}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', flex: '1 1 auto' }}>
                {(isSelected(item.id) || selectedPromoItems.length === 0) && (
                  <div style={{
                    padding: '0.4rem 0.8rem',
                    background: selectedPromoItems.length === 0 ? '#e2e8f0' : 'var(--primary)',
                    color: selectedPromoItems.length === 0 ? '#475569' : 'white',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedPromoItems.length > 0 ? '0 4px 10px rgba(251, 146, 60, 0.3)' : 'none'
                  }}>
                    {getChance(item.id)}% Chance
                  </div>
                )}
                {isSelected(item.id) && (
                  <div 
                    className="flex items-center" 
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '0.2rem 0.3rem 0.2rem 0.8rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', marginRight: '0.5rem' }}>WEIGHT</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={getWeight(item.id) === 0 ? '' : getWeight(item.id)}
                      onChange={e => updateWeight(item.id, e.target.value)}
                      style={{ 
                        width: '45px', 
                        padding: '0.25rem', 
                        fontSize: '0.9rem', 
                        fontWeight: '700',
                        color: 'var(--primary)',
                        margin: 0, 
                        textAlign: 'center',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'var(--accent)',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn-primary w-full" onClick={handleSavePromo}>
          Save Promotion Items
        </button>

        {promoSaved && (
          <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem', fontWeight: '600' }}>
            ✓ Promotion settings saved!
          </p>
        )}
      </div>
    </div>
  );
}
