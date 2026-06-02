import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://user:pass@localhost:5433/catalog_db")
    QUEUE_NAME: str = "product.created"

settings = Settings()