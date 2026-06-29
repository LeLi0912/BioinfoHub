from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.logger import get_logger
from app.models.tool import Category, ToolCategory
from app.schemas.tool import CategoryWithCount

router = APIRouter(prefix="/api/categories", tags=["categories"])
logger = get_logger("api.categories")


@router.get("", response_model=list[CategoryWithCount])
async def list_categories(db: AsyncSession = Depends(get_db)):
    import time
    _start = time.time()

    result = await db.execute(select(Category).order_by(Category.id))
    cats = result.scalars().all()

    tc_subquery = (
        select(ToolCategory.category_id, func.count().label("cnt"))
        .group_by(ToolCategory.category_id)
        .subquery()
    )

    cat_counts = {}
    for cat in cats:
        count_result = await db.execute(
            select(func.count()).select_from(ToolCategory).where(ToolCategory.category_id == cat.id)
        )
        cat_counts[cat.id] = count_result.scalar() or 0

    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/categories, 耗时={duration_ms}ms, 返回数={len(cats)}")

    return [
        CategoryWithCount(
            id=c.id, name=c.name, name_en=c.name_en, slug=c.slug, count=cat_counts.get(c.id, 0)
        )
        for c in cats
    ]
