"""Initialize preset categories. Idempotent — safe to run multiple times."""
import asyncio
from app.database import async_session_factory
from app.models.tool import Category
from sqlalchemy import select

CATEGORIES = [
    {"name": "NGS/高通量测序", "name_en": "NGS/High-throughput Sequencing", "slug": "ngs", "edam_id": "topic_3168"},
    {"name": "单细胞组学", "name_en": "Single-cell Omics", "slug": "single-cell", "edam_id": "topic_3317"},
    {"name": "蛋白质组学", "name_en": "Proteomics", "slug": "proteomics", "edam_id": "topic_0121"},
    {"name": "代谢组学", "name_en": "Metabolomics", "slug": "metabolomics", "edam_id": "topic_3172"},
    {"name": "结构生物学", "name_en": "Structural Biology", "slug": "structural-bio", "edam_id": "topic_1317"},
    {"name": "系统生物学", "name_en": "Systems Biology", "slug": "systems-bio", "edam_id": "topic_3289"},
    {"name": "影像组学", "name_en": "Imaging", "slug": "imaging", "edam_id": "topic_3382"},
    {"name": "表观遗传学", "name_en": "Epigenetics", "slug": "epigenetics", "edam_id": "topic_3173"},
    {"name": "转录组学", "name_en": "Transcriptomics", "slug": "transcriptomics", "edam_id": "topic_3308"},
    {"name": "基因组编辑", "name_en": "Genome Editing", "slug": "genome-editing", "edam_id": "topic_3944"},
    {"name": "药物发现", "name_en": "Drug Discovery", "slug": "drug-discovery", "edam_id": "topic_3336"},
    {"name": "其他", "name_en": "Other", "slug": "other", "edam_id": None},
]


async def main():
    async with async_session_factory() as session:
        added = 0
        skipped = 0
        for cat in CATEGORIES:
            existing = await session.execute(
                select(Category).where(Category.slug == cat["slug"])
            )
            if existing.scalar_one_or_none():
                skipped += 1
            else:
                session.add(Category(**cat))
                added += 1
        await session.commit()
        print(f"分类初始化完成: 新增 {added}, 已存在 {skipped}")


if __name__ == "__main__":
    asyncio.run(main())
