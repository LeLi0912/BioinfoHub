import client from './client';
import type { PaginatedResponse, ToolDetail, ToolSummary } from '../types';

export async function fetchTools(params: {
  q?: string;
  category?: string;
  language?: string;
  sort?: string;
  order?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ToolSummary>> {
  const { data } = await client.get('/tools', { params });
  return data;
}

export async function fetchHotTools(limit = 20): Promise<ToolSummary[]> {
  const { data } = await client.get('/tools/hot', { params: { limit } });
  return data;
}

export async function fetchToolDetail(slug: string): Promise<ToolDetail> {
  const { data } = await client.get(`/tools/${slug}`);
  return data;
}

export async function searchTools(q: string, limit = 10): Promise<ToolSummary[]> {
  const res = await fetchTools({ q, page_size: limit });
  return res.items;
}
