from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logger import setup_logger, get_logger

setup_logger(settings.ENV)
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 42)
    logger.info(f"BioinfoHub 应用启动")
    logger.info(f"环境: {settings.ENV}")
    logger.info(f"数据库: mysql+aiomysql://{settings.DB_USER}@***{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    logger.info(f"日志级别: {'DEBUG' if settings.ENV == 'development' else 'INFO'}")
    logger.info("=" * 42)

    from app.tasks.scheduler import start_scheduler, shutdown_scheduler
    start_scheduler()

    yield

    shutdown_scheduler()
    logger.info("应用关闭")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import tools, categories, compare, trends, sync
app.include_router(compare.router)
app.include_router(tools.router)
app.include_router(categories.router)
app.include_router(trends.router)
app.include_router(sync.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.VERSION}
