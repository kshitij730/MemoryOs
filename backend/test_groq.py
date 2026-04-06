import asyncio
import sys
import os
from dotenv import load_dotenv

# Load from ../.env (root of the workspace)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.services.llm import chat_complete

async def main():
    print("Testing Groq (llama-3.3-70b-versatile) connection...\n")
    print("User: Explain what a 'second brain' is in two sentences.\n")
    print("Assistant (Streaming):", end=" ")
    
    messages = [
        {"role": "user", "content": "Explain what a 'second brain' is in two sentences."}
    ]
    
    try:
        # We explicitly request a streaming response
        response_stream = await chat_complete(messages=messages, stream=True)
        
        async for chunk in response_stream:
            print(chunk, end="", flush=True)
        
        print("\n\n✓ Stream completed successfully!")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        print("\nMake sure your GROQ_API_KEY is properly set in the .env file.")

if __name__ == "__main__":
    asyncio.run(main())
