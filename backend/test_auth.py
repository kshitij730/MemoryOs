import sys
from app.database import get_supabase_anon

def test_auth(email, password, signup=False):
    sb = get_supabase_anon()
    if signup:
        print(f"Signing up {email}...")
        res = sb.auth.sign_up({"email": email, "password": password})
        if res.user:
            print("Signup successful.")
        else:
            print("Signup failed (maybe already exists).")

    print(f"Logging in {email}...")
    try:
        res = sb.auth.sign_in_with_password({"email": email, "password": password})
        if res.session:
            print(f"\nTOKEN (Paste this in CURL):")
            print(res.session.access_token)
        else:
            print("Login failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    email = "testuser@gmail.com"
    password = "testpassword123"
    test_auth(email, password, signup=True)
