import React from "react";

function NewsComponent({ news, onBack }) {
    return (
        <div>
            <button onClick={onBack}>뒤로가기</button>
            <ul>
                {news.map((item, index) => (
                    <li key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.title}
                        </a>
                        <p>{item.summary}</p>
                        <small>{item.news_date}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NewsComponent;
