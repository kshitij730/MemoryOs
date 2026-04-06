import json
from app.database import get_supabase

def get_embedding(text: str) -> list[float]:
    sb = get_supabase()
    res = sb.functions.invoke("embed", invoke_options={"body": {"input": text}})
    try:
        data = json.loads(res.decode("utf-8"))
        if "embeddings" in data and len(data["embeddings"]) > 0:
            return data["embeddings"][0]
        if "embedding" in data:
            return data["embedding"]
    except Exception as e:
        pass
    return []
