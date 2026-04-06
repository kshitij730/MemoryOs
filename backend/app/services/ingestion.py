import io
import os
import pypdf
import docx
import trafilatura
from app.database import get_supabase
from app.services.embeddings import get_embedding
from app.services.llm import chat_complete
from app.config import settings

def extract_text_from_pdf(file_bytes: bytes) -> str:
    pdf = pypdf.PdfReader(io.BytesIO(file_bytes))
    return "\n".join([page.extract_text() for page in pdf.pages])

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_from_url(url: str) -> str:
    downloaded = trafilatura.fetch_url(url)
    return trafilatura.extract(downloaded) or ""

async def process_memory(memory_id: str, user_id: str):
    sb = get_supabase()
    mem_res = sb.table("memories").select("*").eq("id", memory_id).execute()
    if not mem_res.data: return
    mem = mem_res.data[0]
    
    content = ""
    source_type = mem["source_type"]
    
    # ── 1. Text Extraction ───────────────────────────────────────
    try:
        if source_type in ("document", "voice"):
            if "file_path" in mem and mem["file_path"]:
                # Download from storage
                bucket = settings.SUPABASE_BUCKET
                file_bytes = sb.storage.from_(bucket).download(mem["file_path"])
                
                ext = os.path.splitext(mem["file_path"])[1].lower()
                if ext == ".pdf":
                    content = extract_text_from_pdf(file_bytes)
                elif ext == ".docx":
                    content = extract_text_from_docx(file_bytes)
                elif ext in (".txt", ".md"):
                    content = file_bytes.decode("utf-8")
                elif ext in (".mp3", ".wav", ".m4a") or source_type == "voice":
                    # Placeholder for Whisper — for now skip or add basic info
                    content = "Audio file processed. (Whisper transcription placeholder)"
        
        elif source_type == "url":
            content = extract_text_from_url(mem["source_url"])
        
        elif source_type == "note":
            content = mem.get("content", "")
            
    except Exception as e:
        print(f"Extraction error: {e}")
        content = f"Error extracting content: {str(e)}"

    if not content:
        content = "No content extracted."

    # ── 2. FAST SAVE: Save raw content immediately ──────────────
    # This removes the "Processing" state from frontend in milliseconds
    sb.table("memories").update({
        "content": content,
        "is_processed": True
    }).eq("id", memory_id).execute()

    # ── 3. Summary Generation (LLM) ─────────────────────────────
    summary = mem.get("title", "")
    try:
        summary_prompt = f"Summarize this personal memory in 2-3 sentences max. Focus on key entities and concepts:\n\n{content[:4000]}"
        summary = await chat_complete([{"role": "user", "content": summary_prompt}])
        # Update summary separately
        sb.table("memories").update({"summary": summary}).eq("id", memory_id).execute()
    except Exception as e:
        print(f"Summary generation error: {e}")

    # ── 4. BATCH Chunking & Embedding (10x Faster) ──────────────
    chunks = [content[i:i + 1500] for i in range(0, len(content), 1200)]
    chunks_to_insert = []
    
    for i, chunk_text in enumerate(chunks[:25]): # Limit for safety
        vec = get_embedding(chunk_text)
        if vec:
            chunks_to_insert.append({
                "memory_id": memory_id,
                "user_id": user_id,
                "content": chunk_text,
                "embedding": vec,
                "chunk_index": i
            })
    
    if chunks_to_insert:
        # Use batch insert for huge speed boost
        sb.table("memory_chunks").insert(chunks_to_insert).execute()
