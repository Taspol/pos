'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Customer } from '@/types';

export default function Home() {
  const { shop, orders, t, language } = usePOS();
  const router = useRouter();
  const [formData, setFormData] = useState<Customer>({
    nickname: '',
    contact: ''
  });
  const [contactType, setContactType] = useState('line_id');
  const [contactValue, setContactValue] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !contactValue) return;

    if (contactType === 'phone_no') {
      const cleanPhone = contactValue.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        alert(language === 'th' ? 'กรุณาระบุเบอร์โทรศัพท์ให้ครบ 10 หลัก' : 'Please enter a 10-digit phone number');
        return;
      }
    }
    
    const finalContact = `${t(contactType)}: ${contactValue}`;
    sessionStorage.setItem('customer_info', JSON.stringify({ ...formData, contact: finalContact }));
    router.push('/menu');
  };

  const handleTrack = () => {
    const cleanId = trackingId.trim();
    if (!cleanId) return;

    const foundOrder = orders.find(o => o.id === cleanId);
    if (!foundOrder) {
      alert(language === 'th' ? 'ไม่พบหมายเลขคำสั่งซื้อนี้' : 'Order ID not found');
      return;
    }

    if (foundOrder.status === 'completed' || foundOrder.paymentOption === 'later') {
      router.push(`/order/${cleanId}`);
    } else {
      router.push(`/payment/${cleanId}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
      <div className="card w-full" style={{ maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary)' }}>{shop.name}</h1>
        <p style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '2rem' }}>
          {shop.details}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-4">
            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('nickname')}</span>
            <input 
              type="text" 
              placeholder={t('nickname')}
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              required
            />
          </label>
          
          <div className="flex gap-2 items-end mb-4">
            <div style={{ flex: '1' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('contact_type')}</span>
              <select 
                value={contactType}
                onChange={(e) => {
                  setContactType(e.target.value);
                  setContactValue('');
                }}
                style={{ marginBottom: 0 }}
              >
                <option value="line_id">{t('line_id')}</option>
                <option value="ig">{t('ig')}</option>
                <option value="phone_no">{t('phone_no')}</option>
              </select>
            </div>
            <div style={{ flex: '2' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('contact')}</span>
              <input 
                type={contactType === 'phone_no' ? 'tel' : 'text'}
                placeholder={contactType === 'phone_no' ? '08XXXXXXXX' : t('contact')}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                maxLength={contactType === 'phone_no' ? 10 : 50}
                required
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary mt-4">
            {t('view_menu')}
          </button>
        </form>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        <div className="flex flex-col">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>{t('track_order')}</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={t('order_id_placeholder')}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button 
              className="btn-outline" 
              onClick={handleTrack}
            >
              {t('track')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
