'use server';

import prisma from '@/lib/prisma';
import { Order, OrderStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { OrderStatus as PrismaOrderStatus } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { item: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  
  // Transform to match our frontend Order type
  return orders.map(ord => ({
    id: ord.id,
    customer: { nickname: ord.customerNickname, contact: ord.customerContact },
    items: ord.items.map(oi => ({
      ...oi.item,
      quantity: oi.quantity,
      price: oi.priceAtPurchase // Use historical price
    })),
    total: ord.total,
    receiveMethod: ord.receiveMethod,
    paymentOption: ord.paymentOption,
    lat: ord.lat || undefined,
    lng: ord.lng || undefined,
    locationDetail: ord.locationDetail || undefined,
    slipPath: ord.slipPath || undefined,
    status: ord.status.toLowerCase() as OrderStatus,
    timestamp: ord.createdAt.toISOString()
  }));
}

export async function getOrderById(id: string) {
  const ord = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { item: true }
      }
    }
  });
  
  if (!ord) return null;
  
  return {
    id: ord.id,
    customer: { nickname: ord.customerNickname, contact: ord.customerContact },
    items: ord.items.map(oi => ({
      ...oi.item,
      quantity: oi.quantity,
      price: oi.priceAtPurchase
    })),
    total: ord.total,
    receiveMethod: ord.receiveMethod,
    paymentOption: ord.paymentOption,
    lat: ord.lat || undefined,
    lng: ord.lng || undefined,
    locationDetail: ord.locationDetail || undefined,
    slipPath: ord.slipPath || undefined,
    status: ord.status.toLowerCase() as OrderStatus,
    timestamp: ord.createdAt.toISOString()
  };
}

export async function createOrder(data: Omit<Order, 'id' | 'status' | 'timestamp'>) {
  const order = await prisma.order.create({
    data: {
      customerNickname: data.customer.nickname,
      customerContact: data.customer.contact,
      total: data.total,
      receiveMethod: data.receiveMethod,
      paymentOption: data.paymentOption,
      lat: data.lat,
      lng: data.lng,
      locationDetail: data.locationDetail,
      items: {
        create: data.items.map(item => ({
          itemId: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      }
    }
  });
  
  revalidatePath('/admin/orders');
  return order.id;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const prismaStatus = status.toUpperCase() as PrismaOrderStatus;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: prismaStatus }
  });
  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/payment/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function uploadSlip(orderId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file uploaded');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${orderId}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = join(process.cwd(), 'public/payment_slips', filename);
  await writeFile(path, buffer);

  const slipPath = `/payment_slips/${filename}`;
  await prisma.order.update({
    where: { id: orderId },
    data: { slipPath }
  });

  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/payment/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return slipPath;
}

export async function deleteOrder(orderId: string) {
  // Delete related items and messages first
  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.message.deleteMany({ where: { orderId } });
  
  // Delete the order
  await prisma.order.delete({ where: { id: orderId } });
  
  revalidatePath('/admin/orders');
}
