export interface ToolSummary {
  id: number;
  name: string;
  slug: string;
  description: string;
  description_en: string | null;
  github_stars: number;
  github_language: string | null;
  github_license: string | null;
  github_updated_at: string | null;
  github_created_at: string | null;
  categories: { id: number; name: string; slug: string }[];
  created_at: string;
}

export interface ToolDetail extends ToolSummary {
  homepage_url: string | null;
  github_url: string | null;
  github_forks: number;
  github_open_issues: number;
  github_description: string | null;
  github_topics: string[];
  biotools_id: string | null;
  publication_doi: string | null;
  publication_title: string | null;
  publication_year: number | null;
  citation_count: number;
  is_active: boolean;
  updated_at: string;
}

export interface ToolCompareItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  github_url: string | null;
  github_stars: number;
  github_forks: number;
  github_open_issues: number;
  github_language: string | null;
  github_license: string | null;
  github_updated_at: string | null;
  github_created_at: string | null;
  categories: { id: number; name: string; slug: string }[];
  homepage_url: string | null;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TrendRisingItem {
  tool_id: number;
  tool_name: string;
  tool_slug: string;
  stars_start: number;
  stars_end: number;
  stars_gained: number;
  growth_rate: number;
  category_names: string[];
}

export interface CategoryCount {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  count: number;
}

export interface LanguageCount {
  language: string;
  count: number;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface SyncLogItem {
  id: number;
  source: string;
  trigger: string;
  status: string;
  tools_added: number;
  tools_updated: number;
  tools_skipped: number;
  tools_failed: number;
  stats_snapshot_count: number;
  error_message: string | null;
  duration_seconds: number;
  started_at: string;
  finished_at: string | null;
}
