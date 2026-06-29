import asyncio
import datetime
import time
from urllib.parse import urlencode

import httpx

from app.config import settings
from app.logger import get_logger

logger = get_logger("sync.github")

GITHUB_SEARCH_QUERIES = [
    "topic:bioinformatics",
    "topic:bioinformatics-tool",
    "topic:bioinformatics-pipeline",
    "topic:computational-biology",
]


async def _github_request(url: str, client: httpx.AsyncClient) -> dict | None:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    for attempt in range(3):
        try:
            resp = await client.get(url, headers=headers, timeout=30.0)
        except httpx.TimeoutException:
            logger.warning(f"GitHub API 超时, 重试 {attempt + 1}/3")
            await asyncio.sleep(2 ** attempt)
            continue
        except httpx.RequestError as e:
            logger.warning(f"GitHub API 请求失败: {e}, 重试 {attempt + 1}/3")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 403 and "rate limit" in resp.text.lower():
            logger.warning(f"API 限流, 等待 30s 后重试, 重试次数={attempt + 1}/3")
            await asyncio.sleep(30)
            continue

        if resp.status_code == 200:
            remaining = resp.headers.get("X-RateLimit-Remaining", "?")
            logger.debug(f"GitHub API 响应, 状态码=200, rate_limit_remaining={remaining}")
            return resp.json()

        if resp.status_code >= 400:
            logger.warning(f"GitHub API 错误, 状态码={resp.status_code}, url={url}")
            return None

    return None


async def _search_repos(query: str, client: httpx.AsyncClient, page: int = 1) -> list[dict]:
    params = {"q": query, "sort": "stars", "order": "desc", "per_page": settings.SYNC_GITHUB_PER_PAGE, "page": page}
    url = f"{settings.GITHUB_API_BASE}/search/repositories?{urlencode(params)}"
    logger.info(f"请求 GitHub Search API, 页码={page}, 每页={settings.SYNC_GITHUB_PER_PAGE}, 关键词={query}")
    data = await _github_request(url, client)
    if data and "items" in data:
        return data["items"]
    return []


async def fetch_all_repos(client: httpx.AsyncClient | None = None) -> list[dict]:
    _close = client is None
    if client is None:
        client = httpx.AsyncClient()

    all_items: list[dict] = []
    seen: set[str] = set()

    try:
        for query in GITHUB_SEARCH_QUERIES:
            for page in range(1, settings.SYNC_GITHUB_MAX_PAGES + 1):
                repos = await _search_repos(query, client, page)
                if not repos:
                    break
                new_count = 0
                for repo in repos:
                    full_name = repo.get("full_name", "")
                    if full_name and full_name not in seen:
                        seen.add(full_name)
                        all_items.append(repo)
                        new_count += 1
                if new_count == 0:
                    break
                await asyncio.sleep(1.2)
    finally:
        if _close:
            await client.aclose()

    logger.info(f"GitHub 搜索完成, 去重后仓库数={len(all_items)}")
    return all_items


def _parse_iso_datetime(value: str | None):
    if not value:
        return None
    try:
        from datetime import datetime as dt
        value = value.replace("Z", "+00:00")
        return dt.fromisoformat(value).replace(tzinfo=None)
    except (ValueError, TypeError):
        return None


TOPIC_TO_CATEGORY = {
    "rna-seq": "transcriptomics", "rnaseq": "transcriptomics", "rna": "transcriptomics",
    "transcriptomics": "transcriptomics", "transcriptome": "transcriptomics",
    "single-cell": "single-cell", "scrna-seq": "single-cell", "singlecell": "single-cell",
    "scrnaseq": "single-cell", "spatial-transcriptomics": "single-cell",
    "proteomics": "proteomics", "protein": "proteomics", "mass-spectrometry": "proteomics",
    "metabolomics": "metabolomics", "metabolome": "metabolomics",
    "genomics": "ngs", "next-generation-sequencing": "ngs", "ngs": "ngs",
    "whole-genome-sequencing": "ngs", "variant-calling": "ngs",
    "epigenetics": "epigenetics", "methylation": "epigenetics", "chip-seq": "epigenetics",
    "atac-seq": "epigenetics",
    "structural-biology": "structural-bio", "protein-structure": "structural-bio",
    "cryo-em": "structural-bio", "pdb": "structural-bio",
    "systems-biology": "systems-bio", "network-biology": "systems-bio",
    "drug-discovery": "drug-discovery", "cheminformatics": "drug-discovery",
    "virtual-screening": "drug-discovery",
    "crispr": "genome-editing", "genome-editing": "genome-editing",
    "imaging": "imaging", "bioimage": "imaging", "microscopy": "imaging",
    "bioinformatics": None, "bioinformatics-tool": None, "computational-biology": None,
}


def infer_categories_from_topics(topics: list) -> list[str]:
    slugs: set[str] = set()
    for t in topics:
        t_lower = t.lower().strip()
        cat = TOPIC_TO_CATEGORY.get(t_lower)
        if cat:
            slugs.add(cat)
    return list(slugs)


def extract_tool_data(repo: dict) -> dict:
    topics = repo.get("topics", []) or []
    return {
        "name": repo.get("name", "")[:255],
        "slug": repo.get("full_name", "").replace("/", "-").lower()[:255],
        "description_en": (repo.get("description") or "")[:2000],
        "homepage_url": (repo.get("homepage") or "")[:512],
        "github_url": repo.get("html_url", "")[:512],
        "github_stars": repo.get("stargazers_count", 0),
        "github_forks": repo.get("forks_count", 0),
        "github_open_issues": repo.get("open_issues_count", 0),
        "github_license": (repo.get("license") or {}).get("spdx_id", "")[:100] if repo.get("license") else None,
        "github_language": (repo.get("language") or "")[:50] if repo.get("language") else None,
        "github_topics": topics,
        "github_description": (repo.get("description") or "")[:2000],
        "github_updated_at": _parse_iso_datetime(repo.get("updated_at")),
        "github_created_at": _parse_iso_datetime(repo.get("created_at")),
        "category_slugs": infer_categories_from_topics(topics),
    }
