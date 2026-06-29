import { useCallback, useEffect, useState } from 'react';
import { fetchCompare } from '../api/compare';
import { searchTools } from '../api/tools';
import type { ToolCompareItem, ToolSummary } from '../types';
import { logger } from '../api/logger';

const STORAGE_KEY = 'bioinfohub_compare_slugs';

function loadSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSlugs(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>(loadSlugs);
  const [items, setItems] = useState<ToolCompareItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async (s: string[]) => {
    if (s.length === 0) { setItems([]); return; }
    setLoading(true);
    logger.action(`加载对比页, 初始 slugs=${JSON.stringify(s)}`);
    try {
      const data = await fetchCompare(s);
      setItems(data);
    } catch (e) {
      logger.action(`对比加载失败: ${e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems(slugs);
  }, [slugs, loadItems]);

  const addSlug = (slug: string) => {
    if (slugs.includes(slug)) return;
    if (slugs.length >= 4) {
      logger.warn(`拒绝添加: slug=${slug}, 原因=已达上限(4)`);
      return false;
    }
    const next = [...slugs, slug];
    setSlugs(next);
    saveSlugs(next);
    logger.action(`添加对比工具: slug=${slug}, 当前数量=${next.length}`);
    return true;
  };

  const removeSlug = (slug: string) => {
    const next = slugs.filter((s) => s !== slug);
    setSlugs(next);
    saveSlugs(next);
  };

  return { slugs, items, loading, addSlug, removeSlug };
}

export function useCompareSearch() {
  const [results, setResults] = useState<ToolSummary[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const items = await searchTools(q, 10);
      setResults(items);
    } catch { /* ignore */ } finally {
      setSearching(false);
    }
  }, []);

  return { results, searching, search };
}
