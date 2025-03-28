import asyncio
import json
import pandas as pd
from fastapi import FastAPI, WebSocket
from util.chrome_drive import driver
from bs4 import BeautifulSoup
import time
from datetime import datetime
from util import By, WebDriverWait, EC
from starlette.websockets import WebSocketState

app = FastAPI()

# 마지막 17:59 데이터를 저장할 전역 변수
LAST_TREEMAP_DATA = {}

def fetch_data():
    browser = driver()
    try:
        url = "https://finance.finup.co.kr/Lab/ThemeLog"
        browser.get(url)
        WebDriverWait(browser, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "contents01"))
        )
        div_first = BeautifulSoup(browser.page_source, "html.parser").find("div", class_="contents01")
        time.sleep(1)
        theme_box = div_first.find(name="div", class_="box_desc on").find(name="div", id="treemap").find_all(name="div")
        time.sleep(1)
        
        theme_rows = []
        for item in theme_box:
            keyword = item.find("div", class_="nodeKeyword")
            diff = item.find("div", class_="nodeDiff")
            code = item.get("id", "")[1:] if item.has_attr("id") else None
            
            if keyword and diff and code:
                diff_text = diff.text.strip().replace('%', '')
                try:
                    diff_value = float(diff_text)
                except ValueError:
                    diff_value = 0.0
                
                theme_rows.append({
                    "theme_name": keyword.text.strip(),
                    "theme_diff": diff.text.strip(),
                    "theme_code": code,
                    "theme_diff_value": diff_value
                })
        
        df = pd.DataFrame(theme_rows)
        return df
    finally:
        browser.quit()

@app.websocket("/ws/theme")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ 클라이언트 WebSocket 연결됨!")

    try:
        while True:
            current_time = datetime.now()
            if 9 <= current_time.hour < 18:
                df = fetch_data()
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
                await websocket.send_text(json.dumps(data, ensure_ascii=False))
                print("✅ WebSocket 실시간 데이터 전송 완료")
            else:
                await websocket.send_text(json.dumps(LAST_TREEMAP_DATA, ensure_ascii=False))
                print("✅ 18시 이후, 마지막 데이터 반복 전송")

            await asyncio.sleep(60)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    finally:
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()
            print("🔌 WebSocket 연결 종료됨, 3초 후 재연결 시도...")

        await asyncio.sleep(3)  # 3초 대기 후 다시 WebSocket 연결을 시도
        asyncio.create_task(websocket_endpoint(websocket))  # 재시도
