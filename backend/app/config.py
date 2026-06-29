import os


class Settings:
    APP_NAME: str = "BioinfoHub"
    VERSION: str = "0.1.0"
    ENV: str = os.getenv("BIOINFO_ENV", "development")

    # Database
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    # 本地开发默认值，生产环境请通过环境变量覆盖
    DB_USER: str = os.getenv("DB_USER", "bioadmin")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "bioadmin123")
    DB_NAME: str = os.getenv("DB_NAME", "bioinfohub")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    # Sync
    SYNC_CRON_HOUR: int = int(os.getenv("SYNC_CRON_HOUR", "2"))
    SYNC_GITHUB_PER_PAGE: int = 100
    SYNC_GITHUB_MAX_PAGES: int = 5
    SYNC_BIOTOOLS_PER_PAGE: int = 100
    SYNC_BIOTOOLS_MAX_PAGES: int = 3

    # GitHub API
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GITHUB_API_BASE: str = "https://api.github.com"

    # bio.tools API
    BIOTOOLS_API_BASE: str = "https://bio.tools/api"


settings = Settings()
