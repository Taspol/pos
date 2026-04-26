'use server';

import prisma from '@/lib/prisma';
import { Shop } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getShop() {
  const shop = await prisma.shop.findUnique({
    where: { id: 1 },
  });
  
  if (!shop) {
    // Initial shop data
    return await prisma.shop.create({
      data: {
        id: 1,
        name: 'Gravity POS',
        details: 'The ultimate Point of Sale system for modern shops.',
      },
    });
  }
  
  return shop;
}

export async function updateShop(data: Shop) {
  const shop = await prisma.shop.upsert({
    where: { id: 1 },
    update: {
      name: data.name,
      details: data.details,
    },
    create: {
      id: 1,
      name: data.name,
      details: data.details,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin/shop');
  return shop;
}
