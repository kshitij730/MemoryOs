from app.tasks.celery_app import celery_app
@celery_app.task
def run_digest_agent(job_id, user_id):
    pass
