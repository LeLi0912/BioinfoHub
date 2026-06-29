import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import get_logger
from app.models.tool import Category, Tool, ToolCategory, ToolStatsHistory

logger = get_logger("trends")


async def get_rising(session: AsyncSession, days: int = 30, limit: int = 20) -> list[dict]:
    cutoff = datetime.date.today() - datetime.timedelta(days=days)

    latest = (
        select(
            ToolStatsHistory.tool_id,
            ToolStatsHistory.stars,
            ToolStatsHistory.forks,
            ToolStatsHistory.open_issues,
        )
        .where(ToolStatsHistory.snapshot_date >= cutoff)
        .order_by(ToolStatsHistory.snapshot_date.desc())
    ).subquery()

    agg = (
        select(
            latest.c.tool_id,
            func.max(latest.c.stars).label("stars_end"),
            func.min(latest.c.stars).label("stars_start"),
            func.count(latest.c.tool_id).label("snapshot_count"),
        )
        .group_by(latest.c.tool_id)
    ).subquery()

    rising_query = (
        select(
            agg.c.tool_id,
            Tool.name,
            Tool.slug,
            agg.c.stars_start,
            agg.c.stars_end,
            agg.c.snapshot_count,
        )
        .join(Tool, Tool.id == agg.c.tool_id)
        .where(Tool.github_stars > 10)
        .order_by((agg.c.stars_end - agg.c.stars_start).desc())
        .limit(limit)
    )

    result = await session.execute(rising_query)
    rows = result.all()

    items = []
    for tool_id, name, slug, stars_start, stars_end, snap_count in rows:
        if snap_count >= 2:
            stars_gained = stars_end - stars_start
            growth_rate = round((stars_gained / max(stars_start, 1)) * 100, 1)
        else:
            stars_gained = stars_end
            growth_rate = 0.0

        cat_result = await session.execute(
            select(Category.name)
            .join(ToolCategory)
            .where(ToolCategory.tool_id == tool_id)
        )
        cat_names = [r[0] for r in cat_result.all()]

        items.append({
            "tool_id": tool_id,
            "tool_name": name,
            "tool_slug": slug,
            "stars_start": stars_start,
            "stars_end": stars_end,
            "stars_gained": stars_gained,
            "growth_rate": growth_rate,
            "category_names": cat_names,
        })

    return items


async def get_category_distribution(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(Category.name, func.count(ToolCategory.tool_id))
        .join(ToolCategory, Category.id == ToolCategory.category_id)
        .group_by(Category.id, Category.name)
        .order_by(func.count(ToolCategory.tool_id).desc())
    )
    return [{"category_name": r[0], "count": r[1]} for r in result.all()]


async def get_language_distribution(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(Tool.github_language, func.count(Tool.id))
        .where(Tool.github_language.isnot(None))
        .group_by(Tool.github_language)
        .order_by(func.count(Tool.id).desc())
        .limit(20)
    )
    return [{"language": r[0], "count": r[1]} for r in result.all()]


async def get_timeline(session: AsyncSession, days: int = 90) -> list[dict]:
    cutoff = datetime.date.today() - datetime.timedelta(days=days)

    from sqlalchemy import text
    result = await session.execute(
        text("""
            SELECT DATE(github_created_at) as date, COUNT(*) as count
            FROM tools
            WHERE github_created_at >= :cutoff
            GROUP BY DATE(github_created_at)
            ORDER BY date
        """),
        {"cutoff": cutoff},
    )
    rows = result.all()

    by_date: dict[str, int] = {}
    for r in rows:
        key = r[0].isoformat() if hasattr(r[0], "isoformat") else str(r[0])
        by_date[key] = r[1]

    all_dates = []
    for i in range(days):
        d = cutoff + datetime.timedelta(days=i + 1)
        ds = d.isoformat()
        all_dates.append({"date": ds, "count": by_date.get(ds, 0)})

    return all_dates
