import sys
from pathlib import Path
from loguru import logger


def setup_logger(env: str = "development") -> None:
    logger.remove()

    if env == "development":
        logger.add(
            sys.stderr,
            level="DEBUG",
            colorize=True,
            format="<green>{time:HH:mm:ss}</green> | <level>{level: <7}</level> | <cyan>{name}</cyan> | <level>{message}</level>",
        )
    else:
        logger.add(
            sys.stderr,
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <7} | {name} | {message}",
        )
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        logger.add(
            logs_dir / "app_{time:YYYY-MM-DD}.log",
            rotation="10 MB",
            retention="30 days",
            level="INFO",
            encoding="utf-8",
        )
        logger.add(
            logs_dir / "sync_{time:YYYY-MM-DD}.log",
            rotation="50 MB",
            retention="60 days",
            level="INFO",
            encoding="utf-8",
            filter=lambda r: r["name"].startswith("bioinfohub.sync"),
        )


def get_logger(name: str):
    """返回带统一前缀的 logger 实例"""
    return logger.bind(name=f"bioinfohub.{name}")
