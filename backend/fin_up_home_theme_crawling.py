import time
from util.chrome_drive import driver
import pandas as pd
from bs4 import BeautifulSoup


def fetch_data():
    # 크롬 드라이버 초기화
    browser = driver()

    try:
        url = "https://finance.finup.co.kr/Lab/ThemeLog"
        browser.get(url)    

        # HTML 파싱
        div_first = BeautifulSoup(browser.page_source, "html.parser").find("div", class_="contents01")

        theme_box = div_first.find(name="div", class_="box_desc on").find(name="div", id="treemap").find_all(name="div")

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
        data = {'theme_name': theme_texts, 'theme_code': theme_code,'theme_diff' : theme_diff}
        return pd.DataFrame(data)

    finally:
        browser.quit()


if __name__ == "__main__":
    while True:
        df = fetch_data()

        # DataFrame 출력 (혹은 저장/처리)
        print(df)

        # 60초마다 업데이트
        time.sleep(10)