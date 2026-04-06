from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.auth import get_current_user
from app.database import get_supabase
from app.services.llm import chat_complete
import json

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

class Flashcard(BaseModel):
    id: str
    memory_id: str
    user_id: str
    question: str
    answer: str
    difficulty: str
    times_reviewed: int
    last_reviewed: Optional[datetime]
    next_review: Optional[datetime]
    created_at: datetime

class FlashcardGenerateResponse(BaseModel):
    question: str
    answer: str
    difficulty: str

@router.post("/generate/{memory_id}")
async def generate_flashcards(memory_id: str, user=Depends(get_current_user)):
    sb = get_supabase()
    
    # 1. Fetch memory chunks
    chunks_res = sb.table("memory_chunks").select("content").eq("memory_id", memory_id).execute()
    if not chunks_res.data:
        raise HTTPException(status_code=404, detail="Memory not found or has no content")
    
    # Combine chunks for context (limit to avoid token overflow)
    context = "\n".join([c["content"] for c in chunks_res.data[:10]]) # First 10 chunks roughly 5-10k tokens
    
    # 2. Call Groq
    prompt = f"""Generate 5-8 flashcard Q&A pairs from the following content.
    Format as JSON array: [{{"question": "string", "answer": "string", "difficulty": "easy"|"medium"|"hard"}}]
    Make questions specific and testable. Avoid yes/no questions.
    
    CONTENT:
    {context}
    
    JSON:"""
    
    try:
        llm_res = await chat_complete([{"role": "user", "content": prompt}])
        # Parse JSON from response (strip markdown if any)
        if "```json" in llm_res:
            llm_res = llm_res.split("```json")[1].split("```")[0].strip()
        elif "```" in llm_res:
            llm_res = llm_res.split("```")[1].split("```")[0].strip()
        
        cards = json.loads(llm_res)
        
        # 3. Save to DB
        to_insert = []
        for card in cards:
            to_insert.append({
                "memory_id": memory_id,
                "user_id": user["id"],
                "question": card["question"],
                "answer": card["answer"],
                "difficulty": card.get("difficulty", "medium")
            })
        
        res = sb.table("flashcards").insert(to_insert).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_flashcards(memory_id: Optional[str] = None, due_only: bool = False, user=Depends(get_current_user)):
    sb = get_supabase()
    q = sb.table("flashcards").select("*, memories(title, source_type)").eq("user_id", user["id"])
    
    if memory_id:
        q = q.eq("memory_id", memory_id)
    
    if due_only:
        now = datetime.now().isoformat()
        q = q.lte("next_review", now)
        
    res = q.order("next_review", desc=False).execute()
    return res.data

class ReviewBody(BaseModel):
    got_it: bool

@router.post("/{id}/review")
def review_flashcard(id: str, body: ReviewBody, user=Depends(get_current_user)):
    sb = get_supabase()
    
    # Fetch current card
    card_res = sb.table("flashcards").select("*").eq("id", id).eq("user_id", user["id"]).execute()
    if not card_res.data:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    card = card_res.data[0]
    
    # Simple Spaced Repetition Logic:
    # If "got it" -> next review +3 days (initially)
    # If not -> next review +1 day
    # Scale based on times_reviewed if needed, but keeping it simple as requested
    
    days = 3 if body.got_it else 1
    # Bonus: if got it multiple times, increase interval
    if body.got_it:
        days = 3 * (card["times_reviewed"] + 1)
        
    next_review = datetime.now() + timedelta(days=days)
    
    sb.table("flashcards").update({
        "times_reviewed": card["times_reviewed"] + 1,
        "last_reviewed": datetime.now().isoformat(),
        "next_review": next_review.isoformat()
    }).eq("id", id).execute()
    
    return {"ok": True, "next_review": next_review}
