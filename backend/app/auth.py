from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase_anon

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    sb = get_supabase_anon()
    res = sb.auth.get_user(credentials.credentials)
    if not res.user:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return {"id": res.user.id, "email": res.user.email}
