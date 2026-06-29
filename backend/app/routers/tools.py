import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.logger import get_logger
from app.models.tool import Tool, Category, ToolCategory
from app.schemas.tool import (
    PaginatedResponse,
    ToolDetail,
    ToolSummary,
)

router = APIRouter(prefix="/api/tools", tags=["tools"])
logger = get_logger("api.tools")


@router.get("", response_model=PaginatedResponse)
async def list_tools(
    q: str | None = Query(None, description="关键词搜索"),
    category: str | None = Query(None, description="分类 slug"),
    language: str | None = Query(None, description="编程语言"),
    sort: str = Query("stars", description="排序字段 (stars/updated/created)"),
    order: str = Query("desc", description="排序方向"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    _start = 0
    import time
    _start = time.time()

    query = select(Tool).options(joinedload(Tool.categories))

    if q:
        like_q = f"%{q}%"
        query = query.where(
            Tool.name.ilike(like_q) | Tool.description.ilike(like_q) | Tool.description_en.ilike(like_q)
        )

    if category:
        query = query.join(ToolCategory).join(Category).where(Category.slug == category)

    if language:
        query = query.where(Tool.github_language == language)

    sort_map = {
        "stars": Tool.github_stars,
        "updated": Tool.github_updated_at,
        "created": Tool.created_at,
    }
    sort_col = sort_map.get(sort, Tool.github_stars)
    if order == "asc":
        query = query.order_by(sort_col.is_(None), sort_col.asc())
    else:
        query = query.order_by(sort_col.is_(None), sort_col.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    tools = result.unique().scalars().all()

    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/tools, params={{q:{q}, category:{category}, page:{page}, page_size:{page_size}}}, 耗时={duration_ms}ms, 返回数={len(tools)}")

    return PaginatedResponse(
        items=[ToolSummary.model_validate(t) for t in tools],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/hot", response_model=list[ToolSummary])
async def hot_tools(
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Tool)
        .options(joinedload(Tool.categories))
        .order_by(Tool.github_stars.is_(None), Tool.github_stars.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    tools = result.unique().scalars().all()
    logger.info(f"GET /api/tools/hot, limit={limit}, 返回数={len(tools)}")
    return [ToolSummary.model_validate(t) for t in tools]


@router.get("/{slug}", response_model=ToolDetail)
async def get_tool(slug: str, db: AsyncSession = Depends(get_db)):
    import time
    _start = time.time()

    query = select(Tool).options(joinedload(Tool.categories)).where(Tool.slug == slug)
    result = await db.execute(query)
    tool = result.unique().scalar_one_or_none()

    duration_ms = int((time.time() - _start) * 1000)

    if not tool:
        logger.warning(f"GET /api/tools/{slug}, 耗时={duration_ms}ms, 结果=404")
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="工具不存在")

    logger.info(f"GET /api/tools/{slug}, 耗时={duration_ms}ms, 结果=命中")
    return ToolDetail.model_validate(tool)
