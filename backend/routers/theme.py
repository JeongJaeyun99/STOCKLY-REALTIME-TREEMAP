import json, asyncio
from fastapi import APIRouter, WebSocket, HTTPException
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocketState
from datetime import datetime
from service.theme_service import fetch_theme_data, fetch_theme_news

router = APIRouter()
LAST_TREEMAP_DATA = {}

@router.websocket("/ws/theme")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket 연결됨")

    try:
        while True:
            now = datetime.now()
            if 9 <= now.hour < 18:
                df = fetch_theme_data()
                data = {
                    "name": "테마주",
                    "children": [
                        {
                            "name": row["theme_name"],
                            "value": float(row["theme_diff"].replace('%', '').replace('+', '').strip()) if row["theme_diff"].replace('%', '').replace('+', '').replace('.', '', 1).replace('-', '').isdigit() else 0,
                            "code": row["theme_code"]
                        }
                        for _, row in df.iterrows()
                    ]
                }
                LAST_TREEMAP_DATA.update(data)
                await websocket.send_text(json.dumps(data, ensure_ascii=False))
            else:
                await websocket.send_text(json.dumps(LAST_TREEMAP_DATA, ensure_ascii=False))

            await asyncio.sleep(60)
    except Exception as e:
        print(f"❌ WebSocket 오류: {e}")
    finally:
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()
        await asyncio.sleep(3)
        asyncio.create_task(websocket_endpoint(websocket))

@router.get("/theme/news")
def get_news(theme_code: str):
    try:
        news_df = fetch_theme_news(theme_code)
        return JSONResponse(content=news_df.to_dict(orient="records"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"뉴스 크롤링 오류: {e}")
