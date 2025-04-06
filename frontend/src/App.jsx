import React, { useState, useEffect } from "react";
import Treemap from "../components/Treemap";
import NewsComponent from "../components/NewsComponent";

function App() {
    const [data, setData] = useState({ name: "테마주", children: [] }); // 트리맵 데이터
    const [selectedThemeCode, setSelectedThemeCode] = useState(null); // 선택된 테마 코드
    const [newsData, setNewsData] = useState([]); // 뉴스 데이터

    useEffect(() => {
        let socket;

        const connectWebSocket = () => {
            socket = new WebSocket("ws://localhost:8000/ws/theme");

            socket.onopen = () => {
                console.log("✅ WebSocket 연결됨!");
            };

            socket.onmessage = (event) => {
                const receivedData = JSON.parse(event.data);
                setData(receivedData);
                console.log("📊 받은 데이터:", receivedData);
            };

            socket.onerror = (error) => {
                console.error("❌ WebSocket 오류:", error);
            };

            socket.onclose = () => {
                console.log("🔌 WebSocket 연결 종료됨, 3초 후 재연결 시도...");
                setTimeout(connectWebSocket, 3000); // 3초 후 재연결 시도
            };
        };

        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
                console.log("🛑 WebSocket 종료");
            }
        };
    }, []);

    // 특정 테마 클릭 시 호출되는 함수
    const handleThemeClick = async (themeCode) => {
        setSelectedThemeCode(themeCode); // 선택된 테마 코드 저장
    
        try {
            console.log("🔍 API 호출 시작:", themeCode);
            const response = await fetch(`http://localhost:8000/theme/news?theme_code=${themeCode}`);
            console.log("📥 API 응답 상태 코드:", response.status);
    
            const text = await response.text(); // 응답 데이터를 텍스트로 확인
            console.log("📥 API 응답 텍스트:", text);
    
            const data = await response.json(); // JSON으로 파싱 시도
            console.log("📥 API 응답 데이터:", data);
    
            setNewsData(data); // 뉴스 데이터 저장
        } catch (error) {
            console.error("❌ 뉴스 데이터를 가져오는 중 오류 발생:", error);
        }
    };

    return (
        <div>
            <h1>📈 실시간 테마주 트리맵</h1>
            {/* 트리맵 컴포넌트에 클릭 이벤트 전달 */}
            <Treemap data={data} onThemeClick={handleThemeClick} />

            {selectedThemeCode ? (
                // 선택된 테마의 뉴스 표시
                <NewsComponent news={newsData} onBack={() => setSelectedThemeCode(null)} />
            ) : (
                <p>테마를 선택해주세요.</p>
            )}
        </div>
    );
}

export default App;