'use server';

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const configDir = join(process.cwd(), 'uploads');
const configPath = join(configDir, 'promotion.json');

export async function getPromotionItems(): Promise<any[]> {
  try {
    if (!existsSync(configPath)) return [];
    const data = await readFile(configPath, 'utf8');
    const parsed = JSON.parse(data);
    // Backward compatibility if old 'itemIds' exists
    if (parsed.itemIds) {
      return parsed.itemIds.map((id: number) => ({ id, weight: 1 }));
    }
    return parsed.items || [];
  } catch (e) {
    return [];
  }
}

export async function updatePromotionItems(items: any[]) {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  await writeFile(configPath, JSON.stringify({ items }));
}
