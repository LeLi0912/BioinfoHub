from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.logger import get_logger
from app.schemas.tool import LanguageCount, TimelinePoint, TrendRisingItem
from app.services import trends as trends_svc

router = APIRouter(prefix="/api/trends", tags=["trends"])
logger = get_logger("api.trends")


@router.get("/rising", response_model=list[TrendRisingItem])
async def rising_tools(
    days: int = Query(30, ge=7, le=90),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    import time
    _start = time.time()
    items = await trends_svc.get_rising(db, days=days, limit=limit)
    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/trends/rising, days={days}, limit={limit}, 耗时={duration_ms}ms, 返回数={len(items)}")
    return [TrendRisingItem(**i) for i in items]


@router.get("/categories", response_model=list[dict])
async def category_distribution(db: AsyncSession = Depends(get_db)):
    import time
    _start = time.time()
    items = await trends_svc.get_category_distribution(db)
    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/trends/categories, 耗时={duration_ms}ms")
    return items


@router.get("/languages", response_model=list[LanguageCount])
async def language_distribution(db: AsyncSession = Depends(get_db)):
    import time
    _start = time.time()
    items = await trends_svc.get_language_distribution(db)
    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/trends/languages, 耗时={duration_ms}ms")
    return [LanguageCount(**i) for i in items]


@router.get("/timeline", response_model=list[TimelinePoint])
async def timeline(
    days: int = Query(90, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    import time
    _start = time.time()
    items = await trends_svc.get_timeline(db, days=days)
    duration_ms = int((time.time() - _start) * 1000)
    logger.info(f"GET /api/trends/timeline, days={days}, 耗时={duration_ms}ms, 返回数据点数={len(items)}")
    return [TimelinePoint(**i) for i in items]
