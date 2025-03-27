
import React, { useState, useEffect } from "react";
import Treemap from "../components/Treemap";

function App() {
    const [data, setData] = useState({ name: "테마주", children: [] });

    useEffect(() => {
        // WebSocket 연결
        const socket = new WebSocket("ws://localhost:8000/ws/theme");

        // 서버에서 메시지를 받았을 때 실행되는 이벤트
        socket.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            setData(receivedData);
            console.log("📊 받은 데이터:", receivedData);
        };

        // 에러 발생 시
        socket.onerror = (error) => {
            console.error("❌ WebSocket 오류:", error);
        };

        // 컴포넌트 언마운트 시 WebSocket 닫기
        return () => {
            socket.close();
            console.log("🔌 WebSocket 연결 종료");
        };
    }, []);

    return (
        <div >
            <h1>📈 실시간 테마주 트리맵</h1>
            <Treemap data={data} />
            <div
                id="tooltip"
                style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    background: 'rgba(0,0,0,0.75)',
                    color: 'white',
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    zIndex: 999
                }}>
            </div>
        </div>
    );
}

export default App;

