from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.config import settings
from app.database import async_session_factory
from app.logger import get_logger
from app.models.tool import SyncLog
from app.services.sync import run_sync

logger = get_logger("scheduler")

scheduler = AsyncIOScheduler()


async def _sync_job():
    async with async_session_factory() as session:
        result = await session.execute(
            select(SyncLog)
            .where(SyncLog.status == "running")
            .order_by(SyncLog.started_at.desc())
            .limit(1)
        )
        running = result.scalar_one_or_none()
        if running:
            logger.warning(f"跳过本次执行, 上次同步仍在进行中, sync_log_id={running.id}")
            return

    logger.info(f"定时任务触发, job_id=sync_all")
    await run_sync(source="all", trigger="scheduled")
    logger.info(f"定时任务完成, job_id=sync_all")


def start_scheduler():
    scheduler.add_job(
        _sync_job,
        "cron",
        hour=settings.SYNC_CRON_HOUR,
        minute=0,
        id="sync_all",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"注册定时任务, job_id=sync_all, cron=\"0 {settings.SYNC_CRON_HOUR} * * *\"")
    logger.info(f"调度器已启动, 已注册 1 个任务")


def shutdown_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("调度器已关闭")
