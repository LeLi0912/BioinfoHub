import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Tool(Base):
    __tablename__ = "tools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    description_en: Mapped[str | None] = mapped_column(Text)
    homepage_url: Mapped[str | None] = mapped_column(String(512))
    github_url: Mapped[str | None] = mapped_column(String(512), unique=True)
    github_stars: Mapped[int] = mapped_column(Integer, default=0, index=True)
    github_forks: Mapped[int] = mapped_column(Integer, default=0)
    github_open_issues: Mapped[int] = mapped_column(Integer, default=0)
    github_license: Mapped[str | None] = mapped_column(String(100))
    github_language: Mapped[str | None] = mapped_column(String(50), index=True)
    github_topics: Mapped[list | None] = mapped_column(JSON)
    github_description: Mapped[str | None] = mapped_column(Text)
    github_updated_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, index=True)
    github_created_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
    biotools_id: Mapped[str | None] = mapped_column(String(100))
    publication_doi: Mapped[str | None] = mapped_column(String(255))
    publication_title: Mapped[str | None] = mapped_column(Text)
    publication_year: Mapped[int | None] = mapped_column(Integer)
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), index=True
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    categories: Mapped[list["Category"]] = relationship(
        secondary="tool_categories", back_populates="tools", lazy="selectin"
    )
    stats_history: Mapped[list["ToolStatsHistory"]] = relationship(back_populates="tool")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    edam_id: Mapped[str | None] = mapped_column(String(50))

    tools: Mapped[list["Tool"]] = relationship(
        secondary="tool_categories", back_populates="categories", lazy="selectin"
    )


class ToolCategory(Base):
    __tablename__ = "tool_categories"

    tool_id: Mapped[int] = mapped_column(ForeignKey("tools.id"), primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), primary_key=True)


class ToolStatsHistory(Base):
    __tablename__ = "tool_stats_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tool_id: Mapped[int] = mapped_column(ForeignKey("tools.id"), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, default=0)
    forks: Mapped[int] = mapped_column(Integer, default=0)
    open_issues: Mapped[int] = mapped_column(Integer, default=0)
    snapshot_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint("tool_id", "snapshot_date", name="uq_tool_snapshot"),
    )

    tool: Mapped["Tool"] = relationship(back_populates="stats_history")


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    trigger: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    tools_added: Mapped[int] = mapped_column(Integer, default=0)
    tools_updated: Mapped[int] = mapped_column(Integer, default=0)
    tools_skipped: Mapped[int] = mapped_column(Integer, default=0)
    tools_failed: Mapped[int] = mapped_column(Integer, default=0)
    stats_snapshot_count: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=func.now(), index=True)
    finished_at: Mapped[datetime.datetime | None] = mapped_column(DateTime)
