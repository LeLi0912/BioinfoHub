# BioinfoHub

生物信息学工具发现与对比平台。聚合 GitHub 和 bio.tools 的开源生物信息学工具，支持搜索、筛选、对比和趋势分析。

## 功能

- **工具列表** — 搜索、分类筛选、编程语言筛选、多维度排序（Stars / 更新时间 / 收录时间），分页浏览
- **工具详情** — 完整的 GitHub 仓库信息、出版物关联、分类标签、一键加入对比
- **工具对比** — 最多 4 个工具并排对比 Stars / Forks / Issues / 语言 / 协议 / 活跃度等指标
- **趋势面板** — 涨星最快排行榜、分类分布饼图、语言分布柱状图、新增工具时间线
- **数据同步** — GitHub Search API + bio.tools API 双源采集，APScheduler 每日定时同步，支持手动触发

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.12 · FastAPI · SQLAlchemy 2.0 (async) · aiomysql · APScheduler |
| 前端 | React 19 · TypeScript · Vite · Ant Design 6 · ECharts 6 |
| 数据库 | MySQL 8.0 (utf8mb4) |
| 包管理 | uv (Python) · npm (Node) |

## 项目结构

```
bioinfoGet/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI 入口，lifespan，CORS
│   │   ├── config.py               # 环境变量配置（Settings 类）
│   │   ├── database.py             # 异步引擎、会话工厂、Base
│   │   ├── logger.py               # loguru 日志（开发: 彩色终端，生产: 滚动文件）
│   │   ├── models/tool.py          # ORM: Tool, Category, ToolCategory, ToolStatsHistory, SyncLog
│   │   ├── schemas/tool.py         # Pydantic 请求/响应模型
│   │   ├── routers/                # tools, categories, compare, sync, trends
│   │   ├── services/               # github, biotools, sync, trends
│   │   └── tasks/scheduler.py      # 每日凌晨 2:00 定时同步
│   ├── scripts/                    # init_categories, seed_history, backfill_categories
│   ├── alembic/                    # 数据库迁移脚本
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # 路由 (/, /tool/:slug, /compare, /trends)
│   │   ├── api/                    # axios 客户端，API 封装，logger
│   │   ├── hooks/                  # useTools, useTrends, useCompare
│   │   ├── pages/                  # ToolList, ToolDetail, Compare, Trends
│   │   ├── components/             # Layout, ToolCard, SearchBar, FilterPanel 等
│   │   └── types/index.ts          # TypeScript 类型定义
│   └── vite.config.ts              # 端口 5173，API 代理到 127.0.0.1:8000
├── .claude/skills/                 # Claude Code 技能配置
├── CLAUDE.md                       # Claude Code 项目上下文
└── README.md
```

## 快速开始

### 环境要求

- Python 3.12+
- Node.js 20+
- MySQL 8.0+

### 1. 数据库

```sql
CREATE DATABASE IF NOT EXISTS bioinfohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bioadmin'@'localhost' IDENTIFIED BY 'bioadmin123';
GRANT ALL PRIVILEGES ON bioinfohub.* TO 'bioadmin'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 后端

```bash
cd backend

# 创建虚拟环境并安装依赖
uv venv ../.venv
uv pip install -r requirements.txt

# 数据库迁移
PYTHONPATH=. alembic upgrade head

# 初始化分类数据
PYTHONPATH=. python scripts/init_categories.py

# 启动服务
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npx vite --host 127.0.0.1
```

### 4. 访问

| 地址 | 说明 |
|------|------|
| http://127.0.0.1:5173 | 前端页面 |
| http://127.0.0.1:8000/docs | Swagger API 文档 |
| http://127.0.0.1:8000/api/health | 健康检查 |

### 5. 数据同步

```bash
# 手动触发完整同步（GitHub + bio.tools）
curl -X POST http://127.0.0.1:8000/api/sync/trigger

# 生成模拟历史数据（趋势面板需要）
PYTHONPATH=. python scripts/seed_history.py

# 为现有工具回填分类
PYTHONPATH=. python scripts/backfill_categories.py
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `BIOINFO_ENV` | `development` | 运行环境 (development / production) |
| `DB_HOST` | `127.0.0.1` | 数据库地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USER` | `bioadmin` | 数据库用户 |
| `DB_PASSWORD` | `bioadmin123` | 数据库密码 |
| `DB_NAME` | `bioinfohub` | 数据库名 |
| `GITHUB_TOKEN` | (空) | GitHub Personal Access Token（提高 API 限额） |
| `SYNC_CRON_HOUR` | `2` | 每日定时同步的小时 (0-23) |

## API 接口

### 工具

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tools` | 工具列表（q, category, language, sort, order, page, page_size） |
| GET | `/api/tools/hot` | 热门工具（limit: 1-50） |
| GET | `/api/tools/compare` | 工具对比（slugs: 逗号分隔，最多 4 个） |
| GET | `/api/tools/{slug}` | 工具详情 |

### 分类

| GET | `/api/categories` | 分类列表（含工具计数） |

### 趋势

| GET | `/api/trends/rising` | 涨星最快（days: 7-90, limit: 1-50） |
| GET | `/api/trends/categories` | 分类分布 |
| GET | `/api/trends/languages` | 编程语言分布 |
| GET | `/api/trends/timeline` | 新增工具时间线（days: 7-365） |

### 同步

| POST | `/api/sync/trigger` | 手动触发同步（运行中返回 409） |
| GET | `/api/sync/logs` | 同步日志（分页） |

## 数据库模型

5 个表：

- **tools** — 工具主表，GitHub + bio.tools 聚合数据，slug/github_url 唯一索引
- **categories** — 12 个预置分类（NGS、转录组、蛋白组、单细胞等）
- **tool_categories** — 工具-分类多对多关联
- **tool_stats_history** — 每日统计快照（stars/forks/issues），用于趋势计算
- **sync_logs** — 同步记录（来源、触发方式、状态、增改计数）

## 开发注意事项

- **路由顺序**: `/api/tools/compare` 必须在 `/{slug}` 前注册，否则 `compare` 被 slug 捕获
- **MySQL 兼容**: 不支持 `NULLS LAST`，改用 `col.is_(None), col.desc()`；索引列 VARCHAR ≤ 512
- **日期格式**: GitHub API 返回 ISO 8601，需 `_parse_iso_datetime()` 转换为 MySQL 格式
- **ECharts 导入**: 必须 `import ReactECharts from 'echarts-for-react'`，禁用 `/lib/core` tree-shake 导入
- **Sync 架构**: 每工具独立 session 防止事务回滚级联；sync_logs 表做重入保护
- **分类系统**: GitHub 话题 → `TOPIC_TO_CATEGORY` 映射；bio.tools → `EDAM_TO_CATEGORY_SLUG` 映射

## 许可

MIT License
