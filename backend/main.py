import asyncio
import json
import pandas as pd
from fastapi import FastAPI, WebSocket
from util.chrome_drive import driver
from bs4 import BeautifulSoup
import time
from datetime import datetime

app = FastAPI()

# fetch_data 함수 정의
def fetch_data():
    # 크롬 드라이버 초기화
    browser = driver()

    try:
        url = "https://finance.finup.co.kr/Lab/ThemeLog"
        browser.get(url)

        # HTML 파싱
        div_first = BeautifulSoup(browser.page_source, "html.parser").find("div", class_="contents01")
        time.sleep(1)
        theme_box = div_first.find(name="div", class_="box_desc on").find(name="div", id="treemap").find_all(name="div")
        time.sleep(1)
        # 중복 제거를 위해 리스트 사용
        theme_texts = []
        theme_code = []
        theme_diff = []

        for item in theme_box:
            node_keywords = item.find_all("div", class_="nodeKeyword")
            node_diff = item.find_all("div", class_="nodeDiff")
            for keyword in node_keywords:
                if keyword.text != '' and keyword.text.strip() not in theme_texts:
                    theme_texts.append(keyword.text.strip())  # strip()으로 앞뒤 공백 제거

            for diff in node_diff:
                if diff.text != '' and diff.text.strip() not in theme_diff:
                    theme_diff.append(diff.text.strip())  # strip()으로 앞뒤 공백 제거

            if item.has_attr('id') and item['id'][1::] not in theme_code:
                code = item['id'][1::]
                theme_code.append(code)  # id 값을 theme 리스트에 추가

        # DataFrame 생성 및 반환
        data = {'theme_name': theme_texts, 'theme_code': theme_code, 'theme_diff': theme_diff}
        return pd.DataFrame(data)

    finally:
        browser.quit()

# WebSocket 연결
@app.websocket("/ws/theme")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ 클라이언트 WebSocket 연결됨!")

    last_data = None  # 마지막 데이터를 저장할 변수

    try:
        while True:
            # 현재 시간 확인
            current_time = datetime.now()
            if current_time.hour >= 9 and current_time.hour < 18:  # 9시부터 18시까지 실행
                # fetch_data 호출하여 데이터 가져오기
                df = fetch_data()

                # DataFrame을 Treemap 형식의 JSON 데이터로 변환
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

                # 마지막 데이터를 업데이트 (6시에 받은 데이터 저장)
                last_data = treemap_data

                # WebSocket을 통해 클라이언트로 데이터 전송
                await websocket.send_text(json.dumps(treemap_data, ensure_ascii=False))
                print("✅ WebSocket 데이터 전송 완료:", treemap_data)
            elif last_data is not None:  # 6시 이후에는 마지막 데이터를 보냄
                await websocket.send_text(json.dumps(last_data, ensure_ascii=False))
                print("✅ 마지막 데이터 반복 전송:", last_data)
            else:  # 만약 last_data가 None이라면 기본 메시지 전송 (예외 처리)
                print("⚠️ 아직 데이터를 가져오지 못했습니다. 기본 메시지를 보냅니다.")
                await websocket.send_text(json.dumps({"message": "데이터가 준비되지 않았습니다."}, ensure_ascii=False))

            await asyncio.sleep(60)  # 60초마다 업데이트

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

    finally:
        await websocket.close()
        print("🔌 WebSocket 연결 종료됨")

