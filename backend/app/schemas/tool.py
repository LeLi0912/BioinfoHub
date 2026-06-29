import datetime
from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    name_en: str | None = None
    slug: str

    model_config = {"from_attributes": True}


class ToolSummary(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    description_en: str | None = None
    github_stars: int = 0
    github_language: str | None = None
    github_license: str | None = None
    github_updated_at: datetime.datetime | None = None
    github_created_at: datetime.datetime | None = None
    categories: list[CategoryOut] = []
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class ToolDetail(ToolSummary):
    homepage_url: str | None = None
    github_url: str | None = None
    github_forks: int = 0
    github_open_issues: int = 0
    github_description: str | None = None
    github_topics: list | None = None
    biotools_id: str | None = None
    publication_doi: str | None = None
    publication_title: str | None = None
    publication_year: int | None = None
    citation_count: int = 0
    is_active: bool = True
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}


class ToolCompareItem(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    github_url: str | None = None
    github_stars: int = 0
    github_forks: int = 0
    github_open_issues: int = 0
    github_language: str | None = None
    github_license: str | None = None
    github_updated_at: datetime.datetime | None = None
    github_created_at: datetime.datetime | None = None
    categories: list[CategoryOut] = []
    homepage_url: str | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    pages: int


class TrendRisingItem(BaseModel):
    tool_id: int
    tool_name: str
    tool_slug: str
    stars_start: int
    stars_end: int
    stars_gained: int
    growth_rate: float
    category_names: list[str] = []


class CategoryWithCount(CategoryOut):
    count: int = 0


class LanguageCount(BaseModel):
    language: str | None = None
    count: int = 0


class TimelinePoint(BaseModel):
    date: str
    count: int


class SyncTriggerResponse(BaseModel):
    message: str
    sync_log_id: int


class SyncLogOut(BaseModel):
    id: int
    source: str
    trigger: str
    status: str
    tools_added: int
    tools_updated: int
    tools_skipped: int
    tools_failed: int
    stats_snapshot_count: int
    error_message: str | None = None
    duration_seconds: int
    started_at: datetime.datetime
    finished_at: datetime.datetime | None = None

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    detail: str
