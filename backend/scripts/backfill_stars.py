"""Backfill GitHub stars for tools that have github_url but github_stars == 0."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
from sqlalchemy import select, update

from app.database import async_session_factory
from app.models.tool import Tool
from app.services.github import get_repo_stats


async def backfill():
    async with async_session_factory() as session:
        result = await session.execute(
            select(Tool).where(Tool.github_url.isnot(None), Tool.github_url != "", Tool.github_stars == 0)
        )
        tools = result.scalars().all()

    print(f"Found {len(tools)} tools to backfill")

    updated = 0
    failed = 0
    async with httpx.AsyncClient() as client:
        for i, tool in enumerate(tools):
            try:
                gh_data = await get_repo_stats(tool.github_url, client)
                if gh_data and gh_data.get("github_stars", 0) > 0:
                    async with async_session_factory() as session:
                        stmt = (
                            update(Tool)
                            .where(Tool.id == tool.id)
                            .values(
                                github_stars=gh_data["github_stars"],
                                github_forks=gh_data["github_forks"],
                                github_open_issues=gh_data["github_open_issues"],
                                github_language=gh_data.get("github_language") or tool.github_language,
                                github_license=gh_data.get("github_license") or tool.github_license,
                                github_description=gh_data.get("github_description") or tool.github_description,
                                github_topics=gh_data.get("github_topics") or tool.github_topics,
                                github_updated_at=gh_data.get("github_updated_at") or tool.github_updated_at,
                                github_created_at=gh_data.get("github_created_at") or tool.github_created_at,
                            )
                        )
                        await session.execute(stmt)
                        await session.commit()
                    updated += 1
                    if updated % 10 == 0:
                        print(f"  Updated {updated}/{len(tools)}... ({tool.name}: {gh_data['github_stars']} stars)")
                else:
                    failed += 1
            except Exception as e:
                failed += 1
                print(f"  Failed: {tool.name} ({tool.github_url}): {e}")

    print(f"Done. Updated: {updated}, Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(backfill())
