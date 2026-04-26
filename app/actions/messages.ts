'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SenderRole } from '@prisma/client';

export async function getMessages(orderId: string) {
  return await prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMessage(orderId: string, sender: 'customer' | 'admin', text: string) {
  const message = await prisma.message.create({
    data: {
      orderId,
      sender: sender.toUpperCase() as SenderRole,
      text,
    },
  });
  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return message;
}
