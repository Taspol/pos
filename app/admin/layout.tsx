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
    { name: 'Summary', path: '/admin/summary' },
    { name: 'Orders', path: '/admin' },
    { name: 'Inventory', path: '/admin/items' },
    { name: 'Shop Settings', path: '/admin/shop' },
    { name: 'Customer View', path: '/' },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin</h2>
        <nav className="admin-nav">
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
