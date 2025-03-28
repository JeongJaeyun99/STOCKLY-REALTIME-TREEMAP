import React, { useState, useEffect } from "react";
import Treemap from "../components/Treemap";

function App() {
    const [data, setData] = useState({ name: "테마주", children: [] });

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

    return (
        <div>
            <h1>📈 실시간 테마주 트리맵</h1>
            <Treemap data={data} />
            <div
                id="tooltip"
                style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    padding: "6px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    zIndex: 999,
                }}
            ></div>
        </div>
    );
}

export default App;
