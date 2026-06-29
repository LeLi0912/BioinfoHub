# CLAUDE.md

See [README.md](./README.md) for full project documentation.

## Quick Start

```bash
# Backend
cd backend && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend
cd frontend && npx vite --host 127.0.0.1
```

## Key Notes

- Route order matters: `/api/tools/compare` must register before `/api/tools/{slug}`
- MySQL: no `NULLS LAST`, use `col.is_(None), col.desc()` instead; VARCHAR max 512 for indexed columns
- ECharts: use `import ReactECharts from 'echarts-for-react'` (NOT the tree-shakeable `/lib/core` import)
- Sync: per-item async sessions prevent transaction rollback cascade
