import asyncio

import httpx

from app.config import settings
from app.logger import get_logger

logger = get_logger("sync.biotools")

EDAM_TO_CATEGORY_SLUG = {
    "topic_3168": "ngs",
    "topic_3317": "single-cell",
    "topic_0121": "proteomics",
    "topic_3172": "metabolomics",
    "topic_1317": "structural-bio",
    "topic_3289": "systems-bio",
    "topic_3382": "imaging",
    "topic_3173": "epigenetics",
    "topic_3308": "transcriptomics",
    "topic_3944": "genome-editing",
    "topic_3336": "drug-discovery",
}


async def _biotools_request(url: str, client: httpx.AsyncClient) -> dict | None:
    for attempt in range(3):
        try:
            resp = await client.get(url, timeout=30.0)
        except httpx.TimeoutException:
            logger.warning(f"bio.tools API 超时, 重试 {attempt + 1}/3")
            await asyncio.sleep(2 ** attempt)
            continue
        except httpx.RequestError as e:
            logger.warning(f"bio.tools API 请求失败: {e}, 重试 {attempt + 1}/3")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            logger.debug(f"bio.tools API 响应, 状态码=200")
            return resp.json()
        if resp.status_code >= 400:
            logger.warning(f"bio.tools API 错误, 状态码={resp.status_code}")
            return None

    return None


async def fetch_all_tools(client: httpx.AsyncClient | None = None) -> list[dict]:
    _close = client is None
    if client is None:
        client = httpx.AsyncClient()

    all_items: list[dict] = []

    try:
        for page in range(1, settings.SYNC_BIOTOOLS_MAX_PAGES + 1):
            url = f"{settings.BIOTOOLS_API_BASE}/t/?format=json&page={page}&sort=addition_date"
            logger.info(f"请求 bio.tools API, 页码={page}")
            data = await _biotools_request(url, client)
            if not data or "list" not in data:
                break
            items = data["list"]
            if not items:
                break
            all_items.extend(items)
            await asyncio.sleep(0.5)
    finally:
        if _close:
            await client.aclose()

    logger.info(f"bio.tools 获取完成, 工具数={len(all_items)}")
    return all_items


def extract_tool_data(biotool: dict) -> dict:
    name = biotool.get("name", "")[:255]
    biotools_id = biotool.get("biotoolsID", "")

    description = biotool.get("description", "")
    if description and len(description) > 2000:
        description = description[:2000]

    topics = biotool.get("topic", [])
    category_slugs = []
    for topic in topics:
        uri = topic.get("uri", "")
        for edam_id, slug in EDAM_TO_CATEGORY_SLUG.items():
            if edam_id in uri:
                category_slugs.append(slug)
                break

    publications = biotool.get("publication", [])
    doi = None
    pub_title = None
    if publications:
        doi = publications[0].get("doi")
        pub_title = publications[0].get("title") or publications[0].get("metadata", {}).get("title")

    credit = biotool.get("credit", [])
    developer = None
    for c in credit:
        if c.get("typeEntity") == "Person" and c.get("typeRole") == "Developer":
            developer = c.get("name")
            break

    return {
        "name": name,
        "slug": biotools_id.lower().replace(" ", "-").replace("_", "-")[:255] if biotools_id else name.lower().replace(" ", "-")[:255],
        "description": description,
        "description_en": description,
        "homepage_url": biotool.get("homepage", "")[:512],
        "biotools_id": biotools_id,
        "publication_doi": doi,
        "publication_title": pub_title,
        "github_url": None,
        "category_slugs": category_slugs,
    }
