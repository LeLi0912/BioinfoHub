import client from './client';
import type { LanguageCount, TimelinePoint, TrendRisingItem } from '../types';

export async function fetchRisingTools(days = 30, limit = 20): Promise<TrendRisingItem[]> {
  const { data } = await client.get('/trends/rising', { params: { days, limit } });
  return data;
}

export async function fetchCategoryDistribution(): Promise<{ category_name: string; count: number }[]> {
  const { data } = await client.get('/trends/categories');
  return data;
}

export async function fetchLanguageDistribution(): Promise<LanguageCount[]> {
  const { data } = await client.get('/trends/languages');
  return data;
}

export async function fetchTimeline(days = 90): Promise<TimelinePoint[]> {
  const { data } = await client.get('/trends/timeline', { params: { days } });
  return data;
}
