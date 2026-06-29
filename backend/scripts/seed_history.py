"""Seed tool_stats_history with simulated historical data for demo purposes."""
import asyncio
import datetime
import random
from app.database import async_session_factory
from app.models.tool import Tool, ToolStatsHistory
from sqlalchemy import select


async def main():
    async with async_session_factory() as session:
        result = await session.execute(select(Tool))
        tools = result.scalars().all()

        today = datetime.date.today()
        random.seed(42)

        added = 0
        for tool in tools:
            current_stars = tool.github_stars or 0
            if current_stars == 0:
                continue

            for days_ago in range(30, 0, -1):
                d = today - datetime.timedelta(days=days_ago)
                factor = 1.0 - (days_ago / 30.0) * random.uniform(0.1, 0.5)
                hist_stars = max(0, int(current_stars * factor))
                hist_forks = max(0, int((tool.github_forks or 0) * factor))
                hist_issues = max(0, int((tool.github_open_issues or 0) * factor))

                existing = await session.execute(
                    select(ToolStatsHistory).where(
                        ToolStatsHistory.tool_id == tool.id,
                        ToolStatsHistory.snapshot_date == d,
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                session.add(ToolStatsHistory(
                    tool_id=tool.id,
                    stars=hist_stars,
                    forks=hist_forks,
                    open_issues=hist_issues,
                    snapshot_date=d,
                ))
                added += 1

            if added % 500 == 0:
                await session.commit()
                print(f"  已写入 {added} 条...")

        await session.commit()
        print(f"历史数据种子完成: 共写入 {added} 条快照")


if __name__ == "__main__":
    asyncio.run(main())
