// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const Treemap = ({ data }) => {
//     const svgRef = useRef();

//     useEffect(() => {
//         if (!data.length) return;

//         const width = 800, height = 600;
//         const svg = d3.select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height);

//         const root = d3.hierarchy({ children: data }).sum(d => d.value);
//         d3.treemap().size([width, height]).padding(2)(root);

//         const nodes = svg.selectAll("rect").data(root.leaves());
//         nodes.enter()
//             .append("rect")
//             .merge(nodes)
//             .transition().duration(500)
//             .attr("x", d => d.x0)
//             .attr("y", d => d.y0)
//             .attr("width", d => d.x1 - d.x0)
//             .attr("height", d => d.y1 - d.y0)
//             .attr("fill", "steelblue");

//         nodes.exit().remove();
//     }, [data]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Treemap;
// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const Treemap = ({ data }) => {
//     const svgRef = useRef();

//     useEffect(() => {
//         if (!data || !data.children) return;

//         const width = 600;
//         const height = 400;

//         const svg = d3.select(svgRef.current)
//             .attr("width", width)
//             .attr("height", height)
//             .style("background", "#222")
//             .style("color", "white");

//         const hierarchy = d3.hierarchy(data).sum(d => d.value);
//         const treemap = d3.treemap().size([width, height]).padding(4);
//         treemap(hierarchy);

//         const nodes = svg.selectAll("g").data(hierarchy.leaves());

//         // 📌 기존 요소 업데이트 (애니메이션 적용)
//         nodes.transition()
//             .duration(800)
//             .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

//         nodes.select("rect")
//             .transition()
//             .duration(800)
//             .attr("width", d => d.x1 - d.x0)
//             .attr("height", d => d.y1 - d.y0)
//             .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

//         nodes.select("text")
//             .transition()
//             .duration(800)
//             .attr("x", 5)
//             .attr("y", 20)
//             .text(d => `${d.data.name} (${d.data.value})`);

//         // 📌 새 요소 추가
//         const newNodes = nodes.enter().append("g")
//             .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

//         newNodes.append("rect")
//             .attr("width", d => d.x1 - d.x0)
//             .attr("height", d => d.y1 - d.y0)
//             .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
//             .attr("stroke", "white");

//         newNodes.append("text")
//             .attr("x", 5)
//             .attr("y", 20)
//             .text(d => `${d.data.name} (${d.data.value})`)
//             .style("fill", "white")
//             .style("font-size", "14px");

//     }, [data]);

//     return <svg ref={svgRef}></svg>;
// };

// export default Treemap;
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Treemap = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.children) return;

        const width = 800; // SVG 너비
        const height = 500; // SVG 높이

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`) // 뷰박스 설정
            .style("overflow", "visible"); // 잘리지 않도록 설정
        svg.selectAll("*").remove(); // 기존 요소 초기화

        // 계층 구조 생성 및 정렬 (절댓값 사용)
        const hierarchy = d3.hierarchy(data)
            .sum(d => Math.abs(d.value)) // 절댓값 사용
            .sort((a, b) => b.value - a.value); // 절댓값을 기준으로 크기 정렬

        const root = d3.treemap()
            .size([width, height])
            .padding(10)(hierarchy); // 패딩 증가

        // 색상 스케일 설정
        const minValue = d3.min(root.leaves(), d => d.data.value);
        const maxValue = d3.max(root.leaves(), d => d.data.value);

        const colorScale = d => 
            d >= 0 
                ? d3.interpolateReds(d / maxValue) 
                : d3.interpolateBlues(Math.abs(d / minValue));

        // 노드 생성
        const nodes = svg.selectAll("g")
            .data(root.leaves(), d => d.data.name)
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

                    g.append("rect")
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("fill", d => colorScale(d.data.value))
                        .attr("stroke", "white")
                        .transition()
                        .duration(800)
                        .attr("width", d => d.x1 - d.x0)
                        .attr("height", d => d.y1 - d.y0);

                    g.append("text")
                        .attr("x", d => (d.x1 - d.x0) / 2)
                        .attr("y", d => (d.y1 - d.y0) / 2)
                        .style("text-anchor", "middle")
                        .style("font-size", "12px")
                        .style("fill", "white")
                        .style("opacity", 0)
                        .text(d => `${d.data.name} (${d.data.value >= 0 ? "+" : ""}${d.data.value}%)`)
                        .transition()
                        .duration(800)
                        .style("opacity", 1);

                    return g;
                },
                update => update
                    .transition()
                    .duration(800)
                    .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
                    .select("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("fill", d => colorScale(d.data.value)),
                exit => exit
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove()
            );

    }, [data]);

    return <svg ref={svgRef}></svg>;
};

export default Treemap;