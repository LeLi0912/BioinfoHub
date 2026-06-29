import client from './client';
import type { ToolCompareItem } from '../types';

export async function fetchCompare(slugs: string[]): Promise<ToolCompareItem[]> {
  const { data } = await client.get('/tools/compare', {
    params: { slugs: slugs.join(',') },
  });
  return data;
}

export async function fetchCategories(): Promise<{ id: number; name: string; slug: string; count: number }[]> {
  const { data } = await client.get('/categories');
  return data;
}
