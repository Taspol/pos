'use server';

import prisma from '@/lib/prisma';
import { Item } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getItems() {
  return await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function addItem(data: Omit<Item, 'id'>) {
  const item = await prisma.item.create({
    data: {
      name: data.name,
      price: Number(data.price),
      stock: Number(data.stock),
      photo: data.photo,
      description: data.description,
    },
  });
  revalidatePath('/admin/items');
  revalidatePath('/menu');
  return item;
}

export async function updateItem(id: number, data: Omit<Item, 'id'>) {
  const item = await prisma.item.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      price: Number(data.price),
      stock: Number(data.stock),
      photo: data.photo,
      description: data.description,
    },
  });
  revalidatePath('/admin/items');
  revalidatePath('/menu');
  return item;
}

export async function deleteItem(id: number) {
  await prisma.item.delete({
    where: { id },
  });
  revalidatePath('/admin/items');
  revalidatePath('/menu');
}
