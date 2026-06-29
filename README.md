# BioinfoHub

生物信息学工具发现与对比平台。聚合 GitHub 和 bio.tools 的生物信息学开源工具，支持搜索、筛选、排序、工具对比和趋势分析。

## 技术栈

- **后端**: Python 3.12 + FastAPI + SQLAlchemy 2.0 (async) + aiomysql + APScheduler
- **前端**: React 19 + TypeScript + Vite + Ant Design 6 + ECharts 6
- **数据库**: MySQL 8.0 (utf8mb4)
- **虚拟环境**: uv 管理，位于 `.venv/`

## 项目结构

```
bioinfoGet/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 入口，lifespan，CORS，路由注册
│   │   ├── config.py            # Settings 类（环境变量 + 默认值）
│   │   ├── database.py          # async engine, session factory, Base
│   │   ├── logger.py            # loguru 日志配置
│   │   ├── models/tool.py       # 5 个 ORM 模型 (Tool, Category, ToolCategory, ToolStatsHistory, SyncLog)
│   │   ├── schemas/tool.py      # 所有 Pydantic schema
│   │   ├── routers/             # API 路由 (tools, categories, compare, sync, trends)
│   │   ├── services/            # 业务逻辑 (github, biotools, sync, trends)
│   │   └── tasks/scheduler.py   # APScheduler 每日凌晨 2:00 定时同步
│   ├── scripts/                 # init_categories.py, seed_history.py, backfill_categories.py
│   ├── alembic/                 # 数据库迁移
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # 路由定义 (/, /tool/:slug, /compare, /trends)
│   │   ├── api/                 # client.ts (axios), tools.ts, trends.ts, compare.ts, logger.ts
│   │   ├── hooks/               # useTools.ts, useTrends.ts, useCompare.ts
│   │   ├── pages/               # ToolList.tsx, ToolDetail.tsx, Compare.tsx, Trends.tsx
│   │   ├── components/          # Layout, SearchBar, FilterPanel, ToolCard, CompareTable, TrendChart, HotToolRanking
│   │   └── types/index.ts       # TypeScript 类型定义
│   └── vite.config.ts           # 端口 5173，/api 代理到 127.0.0.1:8000
└── .venv/                       # uv 管理的 Python 虚拟环境
```

## 启动命令

### 后端
```bash
cd backend && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 前端
```bash
cd frontend && npx vite --host 127.0.0.1
```

### 浏览器访问
- 前端: `http://127.0.0.1:5173`
- API 文档: `http://127.0.0.1:8000/docs`

## 数据库

MySQL 8.0 (utf8mb4)，通过环境变量配置连接信息：

- `DB_HOST` / `DB_PORT` — 数据库地址和端口
- `DB_USER` / `DB_PASSWORD` — 认证凭据
- `DB_NAME` — 数据库名

### 运行迁移
```bash
cd backend && PYTHONPATH=. .venv/bin/alembic upgrade head
```

### 填充初始数据
```bash
cd backend && PYTHONPATH=. .venv/bin/python scripts/init_categories.py
cd backend && PYTHONPATH=. .venv/bin/python scripts/seed_history.py
```

## API 路由 (共 12 个端点)

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/tools` | GET | 工具列表 (q, category, language, sort, order, page, page_size) |
| `/api/tools/hot` | GET | 热门工具 (limit) |
| `/api/tools/compare` | GET | 工具对比 (slugs, 最多 4 个) |
| `/api/tools/{slug}` | GET | 工具详情 |
| `/api/categories` | GET | 分类列表 |
| `/api/sync/trigger` | POST | 手动触发同步 |
| `/api/sync/logs` | GET | 同步日志 |
| `/api/trends/rising` | GET | 涨星最快 (days, limit) |
| `/api/trends/categories` | GET | 分类分布 |
| `/api/trends/languages` | GET | 语言分布 |
| `/api/trends/timeline` | GET | 新增工具时间线 (days) |

## 开发注意事项

### 路由注册顺序
`/api/tools` 路由中，`/compare` 必须在 `/{slug}` 之前注册，否则 `compare` 会被 slug 参数捕获。

### MySQL 兼容性
- **排序空值**: MySQL 不支持 `NULLS LAST`，使用 `col.is_(None), col.desc()` 替代
- **索引长度**: utf8mb4 下索引最大 3072 字节，VARCHAR 字段不超过 512 字符
- **日期格式**: GitHub API 返回 ISO 8601 (`2026-06-29T06:43:17Z`)，需用 `_parse_iso_datetime()` 转换

### Sync 架构
- 数据来源: GitHub Search API (4 个 topic 查询) + bio.tools API
- 每个工具在独立 async session 中 upsert，防止一个失败导致整批回滚
- 同步状态记录在 `sync_logs` 表，支持重入保护 (409 冲突)

### 趋势面板
- ECharts 必须使用 `import ReactECharts from 'echarts-for-react'`，不能用 `echarts-for-react/lib/core` tree-shake 导入
- Rising 计算基于 `tool_stats_history` 表的 30 天 star 差值

### 分类系统
- 12 个预置分类，slug 如: `ngs`, `transcriptomics`, `proteomics`, `single-cell` 等
- GitHub 工具通过 `TOPIC_TO_CATEGORY` 映射 (github topics → 分类 slug)
- bio.tools 工具通过 `EDAM_TO_CATEGORY_SLUG` 映射 (EDAM URI → 分类 slug)
