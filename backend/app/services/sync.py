import datetime
import time

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.logger import get_logger
from app.models.tool import (
    Category,
    SyncLog,
    Tool,
    ToolCategory,
    ToolStatsHistory,
)
from app.services import github as github_svc
from app.services import biotools as biotools_svc

logger = get_logger("sync")


async def run_sync(source: str = "all", trigger: str = "manual") -> int:
    _start = time.time()
    sync_log = SyncLog(source=source, trigger=trigger, status="running", started_at=datetime.datetime.now())
    async with async_session_factory() as session:
        session.add(sync_log)
        await session.commit()
        await session.refresh(sync_log)
    sync_log_id = sync_log.id

    logger.info("=" * 20 + " 同步任务开始 " + "=" * 20)
    logger.info(f"触发方式={trigger}, 数据源={source}, sync_log_id={sync_log_id}")

    added = updated = skipped = failed = snapshot_count = 0

    try:
        async with httpx.AsyncClient() as client:
            if source in ("all", "github"):
                added_g, updated_g, skipped_g, failed_g = await _sync_github(client)
                added += added_g
                updated += updated_g
                skipped += skipped_g
                failed += failed_g

            if source in ("all", "biotools"):
                added_b, updated_b, skipped_b, failed_b = await _sync_biotools(client)
                added += added_b
                updated += updated_b
                skipped += skipped_b
                failed += failed_b

        snapshot_count = await _write_stats_snapshot()

        status = "success" if failed == 0 else "partial"
        duration = int(time.time() - _start)

        async with async_session_factory() as session:
            log = await session.get(SyncLog, sync_log_id)
            if log:
                log.status = status
                log.tools_added = added
                log.tools_updated = updated
                log.tools_skipped = skipped
                log.tools_failed = failed
                log.stats_snapshot_count = snapshot_count
                log.duration_seconds = duration
                log.finished_at = datetime.datetime.now()
                await session.commit()

        logger.info("=" * 20 + " 同步任务完成 " + "=" * 20)
        logger.info(f"sync_log_id={sync_log_id}, 状态={status}, 总耗时={duration}s")
        logger.info(f"汇总: 新增={added}, 更新={updated}, 跳过={skipped}, 失败={failed}, 快照={snapshot_count}")

    except Exception as e:
        duration = int(time.time() - _start)
        async with async_session_factory() as session:
            log = await session.get(SyncLog, sync_log_id)
            if log:
                log.status = "failed"
                log.error_message = str(e)[:5000]
                log.duration_seconds = duration
                log.finished_at = datetime.datetime.now()
                await session.commit()
        logger.error(f"同步崩溃: {e}")
        raise

    return sync_log_id


async def _sync_github(client: httpx.AsyncClient) -> tuple[int, int, int, int]:
    added = updated = skipped = failed = 0
    try:
        repos = await github_svc.fetch_all_repos(client)
    except Exception as e:
        logger.error(f"GitHub 同步失败: {e}")
        return 0, 0, 0, len(repos) if "repos" in dir() else 0

    for repo in repos:
        try:
            data = github_svc.extract_tool_data(repo)
            category_slugs = data.pop("category_slugs", [])
            async with async_session_factory() as session:
                result = await _upsert_tool(session, data, source_categories=category_slugs)
                await session.commit()
                if result == "added":
                    added += 1
                elif result == "updated":
                    updated += 1
                else:
                    skipped += 1
        except Exception as e:
            logger.warning(f"处理 GitHub 仓库失败 '{repo.get('full_name', '?')}': {e}")
            failed += 1

    logger.info(f"GitHub 处理完成, 新增={added}, 更新={updated}, 跳过={skipped}, 失败={failed}")
    return added, updated, skipped, failed


async def _sync_biotools(client: httpx.AsyncClient) -> tuple[int, int, int, int]:
    added = updated = skipped = failed = 0
    try:
        biotools_list = await biotools_svc.fetch_all_tools(client)
    except Exception as e:
        logger.error(f"bio.tools 同步失败: {e}")
        return 0, 0, 0, 0

    for bt in biotools_list:
        try:
            data = biotools_svc.extract_tool_data(bt)
            category_slugs = data.pop("category_slugs", [])
            async with async_session_factory() as session:
                result = await _upsert_tool(session, data, source_categories=category_slugs)
                await session.commit()
                if result == "added":
                    added += 1
                elif result == "updated":
                    updated += 1
                else:
                    skipped += 1
        except Exception as e:
            logger.warning(f"处理 bio.tools 工具失败 '{bt.get('name', '?')}': {e}")
            failed += 1

    logger.info(f"bio.tools 处理完成, 新增={added}, 更新={updated}, 跳过={skipped}, 失败={failed}")
    return added, updated, skipped, failed


async def _upsert_tool(session: AsyncSession, data: dict, source_categories: list[str] | None) -> str:
    slug = data.get("slug")
    github_url = data.get("github_url")

    tool = None
    if github_url:
        result = await session.execute(select(Tool).where(Tool.github_url == github_url))
        tool = result.scalar_one_or_none()

    if not tool and slug:
        result = await session.execute(select(Tool).where(Tool.slug == slug))
        tool = result.scalar_one_or_none()

    now = datetime.datetime.now()
    category_slugs = source_categories or []

    if tool:
        for key, value in data.items():
            if value is not None and hasattr(tool, key) and key not in ("slug",):
                setattr(tool, key, value)
        tool.updated_at = now
        result = "updated"
    else:
        tool = Tool(**{k: v for k, v in data.items() if k != "category_slugs"})
        tool.created_at = now
        tool.updated_at = now
        session.add(tool)
        result = "added"

    await session.flush()

    if category_slugs:
        cat_result = await session.execute(select(Category).where(Category.slug.in_(category_slugs)))
        categories = {c.slug: c for c in cat_result.scalars().all()}

        for c_slug in category_slugs:
            cat = categories.get(c_slug)
            if cat:
                tc = await session.get(ToolCategory, (tool.id, cat.id))
                if not tc:
                    session.add(ToolCategory(tool_id=tool.id, category_id=cat.id))

    return result


async def _write_stats_snapshot() -> int:
    today = datetime.date.today()
    async with async_session_factory() as session:
        result = await session.execute(select(Tool.id, Tool.github_stars, Tool.github_forks, Tool.github_open_issues))
        tools = result.all()

        count = 0
        for tool_id, stars, forks, issues in tools:
            existing = await session.execute(
                select(ToolStatsHistory).where(
                    ToolStatsHistory.tool_id == tool_id,
                    ToolStatsHistory.snapshot_date == today,
                )
            )
            if existing.scalar_one_or_none():
                continue
            session.add(ToolStatsHistory(
                tool_id=tool_id,
                stars=stars or 0,
                forks=forks or 0,
                open_issues=issues or 0,
                snapshot_date=today,
            ))
            count += 1

        await session.commit()

    logger.info(f"写入 tool_stats_history 快照, 行数={count}")
    return count
