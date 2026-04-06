import json
from app.database import get_supabase

def test():
    sb = get_supabase()
    res = sb.functions.invoke("embed", invoke_options={"body": {"input": "hello"}})
    try:
        data = json.loads(res.decode('utf-8'))
        print("Parsed JSON:", data)
    except Exception as e:
        print("Failed to parse bytes:", res)
        print("Error:", e)

if __name__ == "__main__":
    test()
