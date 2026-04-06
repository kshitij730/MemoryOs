from celery import Celery
from app.config import settings

celery_app = Celery(
    "memoryos",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingest_task", "app.agents.research_agent", "app.agents.digest_agent"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_max_retries=3,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
)
