from app.tasks.celery_app import celery_app
@celery_app.task
def run_research_agent(job_id, user_id, topic):
    pass
