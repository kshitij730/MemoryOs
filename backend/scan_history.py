import os, glob, json

def find_vscode_history():
    appdata = os.environ.get('APPDATA')
    if not appdata:
        appdata = os.path.expanduser('~\\AppData\\Roaming')

    history_dir = os.path.join(appdata, 'Code', 'User', 'History')
    if not os.path.exists(history_dir):
        print("VS Code history not found!")
        return

    found = {}
    for root, dirs, files in os.walk(history_dir):
        if "entries.json" in files:
            try:
                with open(os.path.join(root, "entries.json"), "r", encoding='utf-8') as f:
                    entries = json.load(f)
                
                res = entries.get("resource", "")
                if "backend/app" in res and res.endswith(".py"):
                    file_entries = entries.get("entries", [])
                    # We want the entry right before the wipe. Or any entry that has size > 0.
                    best_id = None
                    best_size = 0
                    for e in file_entries:
                        path = os.path.join(root, e.get("id"))
                        if os.path.exists(path):
                            size = os.path.getsize(path)
                            if size > 100: # not empty
                                best_size = size
                                best_id = e.get("id")
                    
                    if best_id:
                        print(f"[RECOVERABLE] {res} -> {os.path.join(root, best_id)}")
                        found[res] = os.path.join(root, best_id)
            except Exception as e:
                pass

if __name__ == "__main__":
    find_vscode_history()
