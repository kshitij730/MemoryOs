from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase
import uuid

router = APIRouter(prefix="/spaces", tags=["spaces"])

class SpaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "brain"
    color: str = "#7c3aed"

class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

@router.get("/")
def get_spaces(user=Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("spaces").select("*").eq("user_id", user["id"]).order("created_at").execute()
    return res.data

@router.post("/")
def create_space(body: SpaceCreate, user=Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("spaces").insert({
        "user_id": user["id"],
        "name": body.name,
        "description": body.description,
        "icon": body.icon,
        "color": body.color
    }).execute()
    return res.data[0]

@router.patch("/{space_id}")
def update_space(space_id: str, body: SpaceUpdate, user=Depends(get_current_user)):
    sb = get_supabase()
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    res = sb.table("spaces").update(update_data).eq("id", space_id).eq("user_id", user["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Space not found")
    return res.data[0]

@router.delete("/{space_id}")
def delete_space(space_id: str, user=Depends(get_current_user)):
    sb = get_supabase()
    # 1. Get default space id
    default_res = sb.table("spaces").select("id").eq("user_id", user["id"]).eq("is_default", True).execute()
    if not default_res.data:
        raise HTTPException(status_code=500, detail="Default space not found")
    default_id = default_res.data[0]["id"]
    
    if str(space_id) == str(default_id):
        raise HTTPException(status_code=400, detail="Cannot delete default space")

    # 2. Move memories and chat to default space
    sb.table("memories").update({"space_id": default_id}).eq("space_id", space_id).execute()
    sb.table("chat_sessions").update({"space_id": default_id}).eq("space_id", space_id).execute()
    
    # 3. Delete space
    sb.table("spaces").delete().eq("id", space_id).eq("user_id", user["id"]).execute()
    return {"ok": True}
