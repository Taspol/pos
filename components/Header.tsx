'use client';

import { usePOS } from '@/context/POSContext';
import Link from 'next/link';

export default function Header() {
  const { language, setLanguage } = usePOS();

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '1rem',
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setLanguage('th')}
          style={{ 
            padding: '0.25rem 0.75rem', 
            fontSize: '0.8rem',
            background: language === 'th' ? 'var(--primary)' : 'transparent',
            color: language === 'th' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)'
          }}
        >
          TH
        </button>
        <button 
          onClick={() => setLanguage('en')}
          style={{ 
            padding: '0.25rem 0.75rem', 
            fontSize: '0.8rem',
            background: language === 'en' ? 'var(--primary)' : 'transparent',
            color: language === 'en' ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)'
          }}
        >
          EN
        </button>
      </div>
    </header>
  );
}
