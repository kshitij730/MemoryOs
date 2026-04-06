import sys
from app.config import settings
from supabase import create_client

def create_user():
    # Use service key to bypass email verification
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    
    email = "testuser@gmail.com"
    password = "testpassword123"
    
    print(f"Ensuring user {email} is verified...")
    users = sb.auth.admin.list_users()
    target = next((u for u in users if u.email == email), None)
    
    if not target:
        print("Creating user...")
        res = sb.auth.admin.create_user({
            "email": email, 
            "password": password, 
            "email_confirm": True
        })
        print(f"Created: {res.user.id}")
    else:
        print(f"Updating user {target.id}...")
        sb.auth.admin.update_user_by_id(target.id, {
            "password": password,
            "email_confirm": True
        })
        print("Updated.")

    # Login to get token
    pub_sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    res = pub_sb.auth.sign_in_with_password({"email": email, "password": password})
    if res.session:
        print(f"\nTOKEN (Paste this in CURL):")
        print(res.session.access_token)

if __name__ == "__main__":
    create_user()
