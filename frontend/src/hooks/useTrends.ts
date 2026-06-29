import { useCallback, useEffect, useState } from 'react';
import {
  fetchRisingTools,
  fetchCategoryDistribution,
  fetchLanguageDistribution,
  fetchTimeline,
} from '../api/trends';
import type { LanguageCount, TimelinePoint, TrendRisingItem } from '../types';
import { logger } from '../api/logger';

export function useTrends() {
  const [rising, setRising] = useState<TrendRisingItem[]>([]);
  const [categories, setCategories] = useState<{ category_name: string; count: number }[]>([]);
  const [languages, setLanguages] = useState<LanguageCount[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineDays, setTimelineDays] = useState(90);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    logger.action('加载趋势面板');
    Promise.all([
      fetchRisingTools(),
      fetchCategoryDistribution(),
      fetchLanguageDistribution(),
      fetchTimeline(timelineDays),
    ])
      .then(([r, c, l, t]) => {
        setRising(r);
        setCategories(c);
        setLanguages(l);
        setTimeline(t);
        logger.action(`趋势面板加载完成: rising=${r.length}, cat=${c.length}, lang=${l.length}, tl=${t.length}`);
      })
      .catch((e) => {
        const msg = e?.response?.data?.detail || e?.message || String(e);
        logger.action(`趋势加载失败: ${msg}`);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [timelineDays]);

  useEffect(() => {
    load();
  }, [load]);

  return { rising, categories, languages, timeline, loading, error, timelineDays, setTimelineDays, retry: load };
}
