import uuid
import httpx
import os
import time
from loguru import logger
from dotenv import load_dotenv

load_dotenv(override=True)

DAILY_API_KEY = os.getenv("DAILY_API_KEY")
DAILY_DOMAIN = os.getenv("DAILY_DOMAIN")

logger.info(f"DAILY_API_KEY is {DAILY_API_KEY}...")
DAILY_API_URL = "https://api.daily.co/v1/rooms"


async def create_unique_room(prefix: str = "test_ai_agent"):
    room_name = f"{prefix}_{uuid.uuid4().hex[:8]}"
    exp = int(time.time()) + 3600  # 1 hour from now (epoch)


    payload = {
        "name": room_name,
        "properties": {
            "enable_prejoin_ui": False,
            "exp": exp,  # auto-expire in 1 hour
        },
    }

    headers = {
        "Authorization": f"Bearer {DAILY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    logger.info(f"Payload: {payload}, Headers: {headers}")

    async with httpx.AsyncClient() as client:
        resp = await client.post(DAILY_API_URL, json=payload, headers=headers)
        if resp.status_code != 200:
            logger.error(f"Daily API error {resp.status_code}: {resp.text}")
            resp.raise_for_status()
        data = resp.json()

    room_url = f"https://{DAILY_DOMAIN}/{room_name}"
    logger.info(f"Created Daily room: {room_url}")

    return room_url
