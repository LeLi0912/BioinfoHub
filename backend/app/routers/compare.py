from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.logger import get_logger
from app.models.tool import Tool
from app.schemas.tool import ToolCompareItem

router = APIRouter(prefix="/api/tools", tags=["compare"])
logger = get_logger("api.compare")


@router.get("/compare", response_model=list[ToolCompareItem])
async def compare_tools(
    slugs: str = Query(..., description="逗号分隔的 slug 列表，最多 4 个"),
    db: AsyncSession = Depends(get_db),
):
    import time
    _start = time.time()

    slug_list = [s.strip() for s in slugs.split(",") if s.strip()]

    if len(slug_list) > 4:
        logger.warning(f"GET /api/tools/compare, slugs 数量={len(slug_list)}, 超过限制, 返回=400")
        raise HTTPException(status_code=400, detail="最多只能对比 4 个工具")

    if not slug_list:
        raise HTTPException(status_code=400, detail="请提供至少一个工具 slug")

    query = (
        select(Tool)
        .options(joinedload(Tool.categories))
        .where(Tool.slug.in_(slug_list))
    )
    result = await db.execute(query)
    tools = result.unique().scalars().all()

    found_slugs = {t.slug for t in tools}
    for s in slug_list:
        if s not in found_slugs:
            raise HTTPException(status_code=404, detail=f"工具 {s} 不存在")

    tool_map = {t.slug: t for t in tools}
    items = [ToolCompareItem.model_validate(tool_map[s]) for s in slug_list]

    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/tools/compare, slugs={slug_list}, 耗时={duration_ms}ms, 返回数={len(items)}")
    return items
