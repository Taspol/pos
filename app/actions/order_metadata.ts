'use server';

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const configDir = join(process.cwd(), 'uploads');
const configPath = join(configDir, 'order_metadata.json');

export async function getOrderMetadata() {
  try {
    if (!existsSync(configPath)) return {};
    const data = await readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export async function updateOrderReceived(orderId: string, received: boolean) {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  const metadata = await getOrderMetadata();
  metadata[orderId] = {
    ...metadata[orderId],
    received,
    receivedAt: received ? new Date().toISOString() : null
  };
  
  await writeFile(configPath, JSON.stringify(metadata, null, 2));
}
