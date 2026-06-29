import math

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.logger import get_logger
from app.models.tool import SyncLog
from app.schemas.tool import PaginatedResponse, SyncLogOut, SyncTriggerResponse
from app.services.sync import run_sync

router = APIRouter(prefix="/api/sync", tags=["sync"])
logger = get_logger("api.sync")


@router.post("/trigger", response_model=SyncTriggerResponse)
async def trigger_sync(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SyncLog)
        .where(SyncLog.status == "running")
        .order_by(SyncLog.started_at.desc())
        .limit(1)
    )
    running = result.scalar_one_or_none()
    if running:
        raise HTTPException(status_code=409, detail=f"同步任务正在进行中, sync_log_id={running.id}")

    sync_log_id = await run_sync(source="all", trigger="manual")
    logger.info(f"POST /api/sync/trigger, 触发方式=manual, sync_log_id={sync_log_id}")
    return SyncTriggerResponse(message="同步任务已启动", sync_log_id=sync_log_id)


@router.get("/logs", response_model=PaginatedResponse)
async def get_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    count_q = select(func.count()).select_from(SyncLog)
    total = (await db.execute(count_q)).scalar() or 0

    offset = (page - 1) * page_size
    query = select(SyncLog).order_by(SyncLog.started_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    logs = result.scalars().all()

    return PaginatedResponse(
        items=[SyncLogOut.model_validate(log) for log in logs],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )
