import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTools, fetchToolDetail } from '../api/tools';
import type { ToolDetail, ToolSummary } from '../types';
import { logger } from '../api/logger';

export function useToolList() {
  const [items, setItems] = useState<ToolSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    q: '', category: '', language: '', sort: 'stars', order: 'desc', page: 1, page_size: 20,
  });

  const load = useCallback(async (p: typeof params) => {
    setLoading(true);
    try {
      const data = await fetchTools(p);
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      logger.action(`加载工具列表失败: ${e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [params, load]);

  return { items, total, loading, params, setParams };
}

export function useToolDetail(slug: string | undefined) {
  const [tool, setTool] = useState<ToolDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    logger.action(`加载工具详情: slug=${slug}`);
    fetchToolDetail(slug)
      .then((data) => {
        if (!cancelled) {
          setTool(data);
          logger.action(`工具详情加载成功: name=${data.name}`);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.response?.status === 404 ? '工具不存在' : '加载失败');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return { tool, loading, error };
}
