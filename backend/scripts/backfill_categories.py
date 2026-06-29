"""Backfill categories for existing tools based on github_topics."""
import asyncio
from app.database import async_session_factory
from app.models.tool import Tool, Category, ToolCategory
from app.services.github import infer_categories_from_topics
from sqlalchemy import select


async def main():
    async with async_session_factory() as session:
        result = await session.execute(select(Tool).limit(2000))
        tools = result.scalars().all()

        cat_result = await session.execute(select(Category))
        cat_map = {c.slug: c for c in cat_result.scalars().all()}

        assigned = 0
        for tool in tools:
            topics = tool.github_topics or []
            if not topics:
                continue
            slugs = infer_categories_from_topics(topics)
            for s in slugs:
                cat = cat_map.get(s)
                if cat:
                    existing = await session.get(ToolCategory, (tool.id, cat.id))
                    if not existing:
                        session.add(ToolCategory(tool_id=tool.id, category_id=cat.id))
                        assigned += 1

        await session.commit()
        print(f"分类回填完成: 为工具分配了 {assigned} 个分类")


if __name__ == "__main__":
    asyncio.run(main())
