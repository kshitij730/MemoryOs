from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_supabase
from pydantic import BaseModel

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/jobs")
def get_jobs(user=Depends(get_current_user)):
    res = get_supabase().table("jobs").select("*").eq("user_id", user["id"]).order("created_at", desc=True).limit(50).execute()
    return res.data

class ResearchReq(BaseModel):
    topic: str
    depth: int = 1

@router.post("/research")
def launch_research(body: ResearchReq, user=Depends(get_current_user)):
    res = get_supabase().table("jobs").insert({"user_id": user["id"], "job_type": "research", "status": "pending"}).execute()
    job_id = res.data[0]["id"]
    from app.agents.research_agent import run_research_agent
    run_research_agent.delay(job_id, user["id"], body.topic)
    return {"job_id": job_id}

@router.post("/digest")
def launch_digest(user=Depends(get_current_user)):
    res = get_supabase().table("jobs").insert({"user_id": user["id"], "job_type": "digest", "status": "pending"}).execute()
    job_id = res.data[0]["id"]
    from app.agents.digest_agent import run_digest_agent
    run_digest_agent.delay(job_id, user["id"])
    return {"job_id": job_id}
