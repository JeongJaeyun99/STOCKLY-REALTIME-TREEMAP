import asyncio
import json
import requests
import websockets
from fastapi import FastAPI, WebSocket
from config import API_URL

app = FastAPI()

# WebSocket 연결
@app.websocket("/ws/stock")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ 클라이언트 WebSocket 연결됨!")

    try:
        # SSE API 요청
        response = requests.get(API_URL, stream=True, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code != 200:
            await websocket.send_text("❌ API 요청 실패")
            return
        
        # 실시간 데이터 스트리밍
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")

                # SSE 이벤트 감지 (테마 데이터만 전송)
                if decoded_line.startswith("event: theme"):
                    print("🎯 테마 데이터 감지!")

                elif decoded_line.startswith("data: "):
                    json_data = json.loads(decoded_line.replace("data: ", ""))
                    
                    if "data" in json_data:
                        data_list = json_data["data"]

                        # WebSocket을 통해 클라이언트로 데이터 전송
                        await websocket.send_text(json.dumps(data_list, ensure_ascii=False))
                        print("✅ WebSocket 데이터 전송 완료!")

                await asyncio.sleep(1)  # 1초 대기

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

    finally:
        await websocket.close()
        print("🔌 WebSocket 연결 종료됨")
