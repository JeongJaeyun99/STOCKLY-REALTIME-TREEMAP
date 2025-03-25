from util import (generate_user_agent, parse, webdriver,
                  Service, ChromeDriverManager)

def driver():
   userAgent = generate_user_agent()
   user_agent = parse(userAgent)
   # 옵션 설정
   chrome_options = webdriver.ChromeOptions()
   chrome_options.add_argument("--disable-extensions")
   chrome_options.add_argument("disable-infobars")
   chrome_options.page_load_strategy = 'normal'
   chrome_options.add_argument('--enable-automation')
   chrome_options.add_argument('disable-infobars')
   chrome_options.add_argument('disable-gpu')
   chrome_options.add_argument('--no-sandbox')
   chrome_options.add_argument('user-agent={}'.format(user_agent))
   chrome_options.add_argument('--lang=ko_KR')
   chrome_options.add_argument('--ignore-certificate-errors')
   chrome_options.add_argument('--allow-insecure-localhost')
   chrome_options.add_argument('--allow-running-insecure-content')
   chrome_options.add_argument('--disable-notifications')
   chrome_options.add_argument('--disable-dev-shm-usage')
   chrome_options.add_argument('--disable-browser-side-navigation')
   chrome_options.add_argument('--mute-audio')
   chrome_options.add_argument('--headless')  # 이 옵션을 추가하여 헤드리스 모드로 실행

   # 브라우저 열기
   driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
   driver.implicitly_wait(3)
   return driver

if __name__ == "__main__":
   driver = driver()
