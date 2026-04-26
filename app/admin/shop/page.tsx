'use client';

import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Shop } from '@/types';

export default function AdminShop() {
  const { shop, updateShop } = usePOS();
  const [formData, setFormData] = useState<Shop>({ ...shop });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="mb-4">Shop Settings</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
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
            Save Settings
          </button>
          
          {saved && (
            <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem', fontWeight: '600' }}>
              ✓ Settings saved successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
