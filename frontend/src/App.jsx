// import React, { useState, useEffect } from "react";
// import Treemap from "../components/Treemap";

// const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

// function App() {
//     const [data, setData] = useState([]);

//     useEffect(() => {
//         ws.onopen = () => console.log("✅ WebSocket 연결됨!");
//         ws.onmessage = (event) => {
//             console.log("📩 실시간 데이터 수신!", event.data);
//             setData(JSON.parse(event.data));
//         };
//         ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");
//         return () => ws.close();
//     }, []);

//     return (
//         <div>
//             <h1>📈 실시간 테마주 트리맵</h1>
//             <Treemap data={data} />
//         </div>
//     );
// }

// export default App;

// import React, { useState, useEffect } from "react";
// import Treemap from "../components/Treemap";

// // 랜덤 데이터 생성 함수
// const generateRandomData = () => ({
//     name: "테마주",
//     children: [
//         { name: "반도체", value: Math.floor(Math.random() * 20) + 5 },
//         { name: "2차전지", value: Math.floor(Math.random() * 20) + 5 },
//         { name: "AI", value: Math.floor(Math.random() * 20) + 5 },
//         { name: "전기차", value: Math.floor(Math.random() * 20) + 5 },
//         { name: "바이오", value: Math.floor(Math.random() * 20) + 5 }
//     ]
// });

// function App() {
//     const [data, setData] = useState(generateRandomData());

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setData(generateRandomData()); // 1초마다 랜덤 데이터 업데이트
//         }, 1000);

//         return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 해제
//     }, []);

//     return (
//         <div>
//             <h1>📈 실시간 테마주 트리맵</h1>
//             <Treemap data={data} />
//         </div>
//     );
// }

// export default App;


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

