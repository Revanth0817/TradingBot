from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SmartAPI Algo Backend"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    angel_base_url: str = "https://apiconnect.angelone.in"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
