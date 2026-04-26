'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Order } from '@/types';
import { uploadSlip } from '@/app/actions/orders';

export default function Payment() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { orders, updateOrderStatus, t } = usePOS();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const foundOrder = orders.find(ord => ord.id === orderId);
    if (foundOrder) {
      if (!order && foundOrder.status === 'completed') {
        setShowModal(true);
      } else if (order && order.status !== 'completed' && foundOrder.status === 'completed') {
        setShowModal(true);
      }
      setOrder(foundOrder);
    }
  }, [orders, orderId, order]);

  if (!order) return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner mb-4"></div>
      <h2 style={{ color: 'var(--secondary)' }}>Verifying your order...</h2>
      <p style={{ color: 'var(--secondary)', opacity: 0.7 }}>Please wait while we sync with the server.</p>
    </main>
  );

  const handleAdminAcceptSimulation = () => {
    updateOrderStatus(orderId, 'awaiting_payment');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadSlip(orderId, formData);
      alert('Payment slip uploaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload payment slip.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ maxWidth: '500px', textAlign: 'center' }}>
      <h1>Payment</h1>
      <p className="mb-4">Order ID: {order.id}</p>

      {order.status === 'pending' && (
        <div className="card">
          <div className="mb-4" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            {t('waiting_admin')}
          </div>
          <p style={{ color: 'var(--secondary)' }}>
            {t('admin_confirm_msg')}
          </p>
        </div>
      )}

      {order.status === 'awaiting_payment' && (
        <div className="card">
          <h3>{t('scan_to_pay')}</h3>
          <p className="mb-4">{t('total')}: ฿{order.total}</p>
          <div style={{ 
            width: '250px', 
            height: '250px', 
            background: '#eee', 
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius)'
          }}>
            {order.paymentOption === 'now' ? (
              <img 
                src="/qr.JPG" 
                alt="Payment QR Code" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius)' }} 
              />
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{t('pay_on_delivery')}</span>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
            {order.paymentOption === 'now' 
              ? t('admin_confirm_msg') 
              : t('pay_later_msg')}
          </p>

          {order.paymentOption === 'now' && (
            <div className="mb-4">
              <label className="btn-outline w-full block text-center mb-2" style={{ cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : order.slipPath ? `${t('change_slip')}` : `📁 ${t('upload_slip')}`}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {order.slipPath && (
                <p style={{ fontSize: '0.75rem', color: 'green' }}>{t('slip_uploaded')}: {order.slipPath.split('/').pop()}</p>
              )}
            </div>
          )}

          <button className="btn-primary w-full" onClick={() => updateOrderStatus(orderId, 'paid_awaiting_approval')}>
            {t('i_have_paid')}
          </button>
        </div>
      )}

      {order.status === 'paid_awaiting_approval' && (
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h3>{t('paid_awaiting_approval')}</h3>
          <p className="mb-4" style={{ color: 'var(--secondary)' }}>
            {t('waiting_payment_approval_msg')}
          </p>
          <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
            {t('total')}: ฿{order.total}
          </div>
        </div>
      )}

      {order.status === 'completed' && (
        <div className="card">
          <h2 style={{ color: 'green' }}>{t('order_successful')}</h2>
          <p className="mb-4">{t('save_order_id')} <strong>{order.id}</strong></p>
          <button className="btn-primary w-full" onClick={() => router.push(`/order/${orderId}`)}>
            {t('view_order_details')}
          </button>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Order Confirmed!</h2>
            <p className="mb-2">Please capture or save your Order ID:</p>
            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: 'var(--radius)', 
              fontSize: '1.2rem', 
              fontWeight: '700',
              border: '2px dashed var(--primary)',
              marginBottom: '1.5rem',
              color: 'var(--primary)',
              letterSpacing: '1px'
            }}>
              {order.id}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
              You can use this ID to track your order later.
            </p>
            <button className="btn-primary w-full" onClick={() => setShowModal(false)}>
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
