'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Customer, CartItem } from '@/types';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: '#eee', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export default function Checkout() {
  const { items, addOrder, t } = usePOS();
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [receiveMethod, setReceiveMethod] = useState('delivery');
  const [paymentOption, setPaymentOption] = useState('now');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationDetail, setLocationDetail] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
  }, []);

  useEffect(() => {
    const custInfo = sessionStorage.getItem('customer_info');
    const cartInfo = sessionStorage.getItem('cart');
    
    if (!custInfo || !cartInfo) {
      router.push('/');
    } else {
      setCustomer(JSON.parse(custInfo));
      setCart(JSON.parse(cartInfo));
    }
  }, [router]);

  if (!customer || Object.keys(cart).length === 0) return null;

  const baseCartItems: CartItem[] = Object.entries(cart).map(([id, qty]) => {
    const item = items.find(it => it.id === parseInt(id));
    if (!item) return null;
    return { ...item, quantity: qty };
  }).filter((item): item is CartItem => item !== null);

  const cartItems = [...baseCartItems];

  const promoId = typeof window !== 'undefined' ? sessionStorage.getItem('promotion_item_id') : null;
  if (promoId) {
    const promoItem = items.find(it => it.id === parseInt(promoId));
    if (promoItem) {
      cartItems.push({
        ...promoItem,
        price: 0,
        name: `🎁 ${promoItem.name} (${t('free')})`,
        quantity: 1
      });
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!customer) return;
    const orderId = await addOrder({
      customer,
      items: cartItems,
      total: totalPrice,
      receiveMethod,
      paymentOption,
      lat: location?.lat,
      lng: location?.lng,
      locationDetail
    });
    setPlacedOrderId(orderId);
    sessionStorage.removeItem('cart');
    sessionStorage.removeItem('promotion_item_id');
    sessionStorage.removeItem('promotion_claimed');
  };

  const handleCopyId = () => {
    if (placedOrderId) {
      navigator.clipboard.writeText(placedOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveImage = async () => {
    if (modalRef.current) {
      const canvas = await html2canvas(modalRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `order-${placedOrderId}.png`;
      link.click();
    }
  };

  return (
    <main style={{ maxWidth: '600px' }}>
      <h1>{t('order_summary')}</h1>
      
      <div className="card mb-4">
        <h3>{t('items')}</h3>
        {cartItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>฿{item.price * item.quantity}</span>
          </div>
        ))}
        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
        <div className="flex justify-between" style={{ fontWeight: '700', fontSize: '1.2rem' }}>
          <span>{t('total')}</span>
          <span>฿{totalPrice}</span>
        </div>
      </div>

      <div className="card mb-4">
        <h3>{t('receive_method')}</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 p-2" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="receiveMethod" 
              value="delivery" 
              checked={receiveMethod === 'delivery'} 
              onChange={() => setReceiveMethod('delivery')}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <span>{t('delivery')}</span>
          </label>
          <label className="flex items-center gap-2 p-2" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="receiveMethod" 
              value="pickup" 
              checked={receiveMethod === 'pickup'} 
              onChange={() => setReceiveMethod('pickup')}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <span>{t('pickup')}</span>
          </label>
        </div>

        {receiveMethod === 'delivery' && (
          <div className="mt-4">
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{t('select_location')}</h4>
            <LocationPicker onLocationSelect={handleLocationSelect} />
            
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              {t('address_details')}
            </label>
            <input 
              type="text" 
              placeholder="e.g. Building 6, Room 204"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              required
              style={{ marginBottom: 0 }}
            />
          </div>
        )}
      </div>

      <div className="card mb-4">
        <h3>{t('payment_option')}</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 p-2" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="paymentOption" 
              value="now" 
              checked={paymentOption === 'now'} 
              onChange={() => setPaymentOption('now')}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <span>{t('pay_now')}</span>
          </label>
          <label className="flex items-center gap-2 p-2" style={{ cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="paymentOption" 
              value="later" 
              checked={paymentOption === 'later'} 
              onChange={() => setPaymentOption('later')}
              style={{ width: 'auto', marginBottom: 0 }}
            />
            <span>{t('pay_later')}</span>
          </label>
        </div>
      </div>

      <button className="btn-primary w-full" onClick={handlePlaceOrder}>
        {t('confirm_and_pay')}
      </button>
      <button className="btn-outline w-full mt-4" onClick={() => router.back()}>
        {t('go_back')}
      </button>

      {placedOrderId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div className="card" ref={modalRef} style={{ maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{t('order_sent')}</h2>
            <p className="mb-4">{t('order_received_msg')}</p>
            
            <p className="mb-2" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t('save_order_id')}</p>
            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: 'var(--radius)', 
              fontSize: '1.2rem', 
              fontWeight: '700',
              border: '2px dashed var(--primary)',
              marginBottom: '1rem',
              color: 'var(--primary)',
              letterSpacing: '1px'
            }}>
              {placedOrderId}
            </div>

            <div className="flex gap-2 mb-4">
              <button 
                className="btn-outline" 
                onClick={handleSaveImage}
                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}
              >
                {t('save_as_image')}
              </button>
              <button 
                className="btn-outline" 
                onClick={handleCopyId}
                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: copied ? 'green' : 'inherit' }}
              >
                {copied ? `${t('copied')}` : `${t('copy_id')}`}
              </button>
            </div>
            
            <button 
              className="btn-primary w-full" 
              onClick={() => router.push(paymentOption === 'later' ? `/order/${placedOrderId}` : `/payment/${placedOrderId}`)}
            >
              {paymentOption === 'later' ? t('view_order_details') : t('continue_to_payment')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
