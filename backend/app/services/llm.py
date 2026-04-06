import os
from groq import AsyncGroq
from app.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def chat_complete(messages: list, stream: bool = False):
    res = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        stream=stream
    )
    if not stream:
        return res.choices[0].message.content
    
    async def gen():
        async for chunk in res:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    return gen()
