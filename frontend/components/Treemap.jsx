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
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Treemap = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.children) return;

        const width = 600;
        const height = 400;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background", "#222")
            .style("color", "white");

        const hierarchy = d3.hierarchy(data).sum(d => d.value);
        const treemap = d3.treemap().size([width, height]).padding(4);
        treemap(hierarchy);

        const nodes = svg.selectAll("g").data(hierarchy.leaves());

        // 📌 기존 요소 업데이트 (애니메이션 적용)
        nodes.transition()
            .duration(800)
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

        nodes.select("rect")
            .transition()
            .duration(800)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

        nodes.select("text")
            .transition()
            .duration(800)
            .attr("x", 5)
            .attr("y", 20)
            .text(d => `${d.data.name} (${d.data.value})`);

        // 📌 새 요소 추가
        const newNodes = nodes.enter().append("g")
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

        newNodes.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
            .attr("stroke", "white");

        newNodes.append("text")
            .attr("x", 5)
            .attr("y", 20)
            .text(d => `${d.data.name} (${d.data.value})`)
            .style("fill", "white")
            .style("font-size", "14px");

    }, [data]);

    return <svg ref={svgRef}></svg>;
};

export default Treemap;
