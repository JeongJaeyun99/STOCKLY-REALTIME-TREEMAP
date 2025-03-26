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

# fetch_data 함수 수정
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

        # 리스트에 각 항목 정보 저장
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
                    diff_value = 0.0  # 혹시 변환 실패 시 기본값

                theme_rows.append({
                    "theme_name": keyword.text.strip(),
                    "theme_diff": diff.text.strip(),
                    "theme_code": code,
                    "theme_diff_value": diff_value  # ✅ 숫자형으로 추가!
                })

        df = pd.DataFrame(theme_rows)

        # print(df)
        print("\n✔ 컬럼별 개수:")
        for col in df.columns:
            print(f"{col}: {df[col].count()}")

        return df

    finally:
        browser.quit()

@app.websocket("/ws/theme")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ 클라이언트 WebSocket 연결됨!")

    treemap_data = {}  # 초기 treemap 데이터

    try:
        while True:
            current_time = datetime.now()
            if 9 <= current_time.hour < 18:
                df = fetch_data()

                # 정상적인 데이터가 반환된 경우 업데이트
                treemap_data = {
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

                # WebSocket으로 전송
                if websocket.client_state != WebSocketState.DISCONNECTED:
                    await websocket.send_text(json.dumps(treemap_data, ensure_ascii=False))
                    print("✅ WebSocket 데이터 전송 완료:", treemap_data)

            else:
                # 장시간 외에는 마지막 데이터를 반복 전송
                if websocket.client_state != WebSocketState.DISCONNECTED:
                    await websocket.send_text(json.dumps(treemap_data, ensure_ascii=False))
                    print("✅ 마지막 데이터 반복 전송:", treemap_data)

            await asyncio.sleep(60)

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

    finally:
        # 연결이 끊어졌다면 close 호출
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()
            print("🔌 WebSocket 연결 종료됨")
