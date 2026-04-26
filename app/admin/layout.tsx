'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Orders', path: '/admin' },
    { name: 'Inventory', path: '/admin/items' },
    { name: 'Shop Settings', path: '/admin/shop' },
    { name: 'Customer View', path: '/' },
  ];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <aside style={{ 
        width: '260px', 
        background: 'var(--card-bg)', 
        borderRight: '1px solid var(--border)',
        padding: '2rem 1rem'
      }}>
        <h2 style={{ padding: '0 1rem', color: 'var(--primary)', marginBottom: '2rem' }}>Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--foreground)',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
