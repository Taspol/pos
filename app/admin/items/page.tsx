'use client';

import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { getDirectImageUrl } from '@/lib/utils';
import { Item } from '@/types';
import Link from 'next/link';

export default function AdminItems() {
  const { items, addItem, updateItem, t } = usePOS();
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    name: '',
    price: 0,
    stock: 0,
    photo: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price.toString()),
      stock: parseInt(formData.stock.toString())
    };

    if (editingItem) {
      await updateItem(editingItem.id, data);
      setEditingItem(null);
    } else {
      await addItem(data);
      setShowAdd(false);
    }
    setFormData({ name: '', price: 0, stock: 0, photo: '', description: '' });
  };

  const startEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      stock: item.stock,
      photo: item.photo,
      description: item.description
    });
    setShowAdd(true);
  };

  return (
    <div>
      <div className="flex flex-col-mobile justify-between items-center mb-4 gap-4">
        <h1>{t('manage_items')}</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="btn-outline">
            ← Orders
          </Link>
          <button className="btn-primary" onClick={() => {
            setShowAdd(!showAdd);
            setEditingItem(null);
            setFormData({ name: '', price: 0, stock: 0, photo: '', description: '' });
          }}>
            {showAdd ? t('go_back') : `+ ${t('items')}`}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-8">
          <h3>{editingItem ? 'Edit Item' : t('manage_items')}</h3>
          <form onSubmit={handleSubmit} className="responsive-grid">
            <div>
              <label>Item Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <label>Price (฿)</label>
              <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              
              <label>Stock Quantity</label>
              <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
            </div>
            <div>
              <label>Photo URL</label>
              <input type="text" placeholder="https://..." value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} />
              
              <label>Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <button type="submit" className="btn-primary w-full mt-4">
                {editingItem ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="card flex flex-col-mobile gap-4 items-center">
            <div style={{ 
              width: '100px', 
              height: '100px', 
              minWidth: '100px',
              borderRadius: 'var(--radius)',
              overflow: 'hidden'
            }} className="mobile-full-width">
              <img 
                src={getDirectImageUrl(item.photo)} 
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'inherit' }}>
              <h3 style={{ marginBottom: 0 }}>{item.name}</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>฿{item.price} | Stock: {item.stock}</p>
            </div>
            <button className="btn-outline w-mobile-full" onClick={() => startEdit(item)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
