import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Treemap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.children) return;

    const width = 855;
    const height = 410;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    const positiveData = {
      name: "양수",
      children: data.children.filter((d) => d.value >= 0),
    };

    const negativeData = {
      name: "음수",
      children: data.children.filter((d) => d.value < 0),
    };

    const posHierarchy = d3
      .hierarchy(positiveData)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const negHierarchy = d3
      .hierarchy(negativeData)
      .sum((d) => Math.abs(d.value))
      .sort((a, b) => a.value - b.value); // 음수 값 기준으로 정렬

    const posRoot = d3
      .treemap()
      .size([width / 2, height])
      .padding(5)(posHierarchy);

    const negRoot = d3
      .treemap()
      .size([width / 2, height])
      .padding(5)(negHierarchy);

    negRoot.eachBefore((node) => {
      if (node.parent) {
        node.x0 = width / 2 + node.x0;
        node.x1 = width / 2 + node.x1;
      }
    });

    const minNeg = d3.min(negativeData.children, (d) => d.value);
    const maxPos = d3.max(positiveData.children, (d) => d.value);

    const colorScale = (d) =>
      d >= 0
        ? d3.interpolateReds(d / maxPos)
        : d3.interpolateBlues(Math.abs(d / minNeg));

    // Positive nodes
    svg
      .selectAll("g.pos")
      .data(posRoot.leaves())
      .join("g")
      .attr("class", "pos")
      .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
      .call((g) => {
        // 사각형 그리기
        g.append("rect")
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0)
          .attr("fill", (d) => colorScale(d.data.value))
          .attr("stroke", "white");
      
        g.append("text")
          .attr("x", (d) => (d.x1 - d.x0) / 2)
          .attr("y", (d) => (d.y1 - d.y0) / 2 - 6)
          .attr("text-anchor", "middle")
          .style("font-size", (d) => `${Math.max(Math.min((d.x1 - d.x0) / 8, 14), 8)}px`)
          .style("fill", "white")
          .selectAll("tspan")
          .data((d) => {
            const boxWidth = d.x1 - d.x0;
            if (boxWidth < 40) return []; // 너무 작으면 아무것도 안 그림
            if (boxWidth < 60) return [d.data.name]; // 작으면 한 줄만
            return [d.data.name, `+${d.data.value}%`]; // 넉넉하면 두 줄
          })
          .enter()
          .append("tspan")
          .attr("x", (d, i, nodes) => {
            const parent = d3.select(nodes[i].parentNode);
            return parent.attr("x");
          })
          .attr("dy", (d, i) => (i === 0 ? 0 : "1.2em"))
          .text((d) => d)
          .on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`<strong>${d.data.name}</strong><br/>${d.data.value}%`)
              .style("left", event.pageX + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function () {
            d3.select("#tooltip").style("opacity", 0);
          });
          g.on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`<strong>${d.data.name}</strong><br/>${d.data.value}%`)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 30 + "px");
          })
          .on("mousemove", function (event) {
            d3.select("#tooltip")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 30 + "px");
          })
          .on("mouseout", function () {
            d3.select("#tooltip").style("opacity", 0);
          });
        });

    // Negative nodes (shift x by width / 2)
    svg
      .selectAll("g.neg")
      .data(negRoot.leaves())
      .join("g")
      .attr("class", "neg")
      .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
      .call((g) => {
        // 사각형 그리기
        g.append("rect")
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0)
          .attr("fill", (d) => colorScale(d.data.value))
          .attr("stroke", "white");
      
        g.append("text")
          .attr("x", (d) => (d.x1 - d.x0) / 2)
          .attr("y", (d) => (d.y1 - d.y0) / 2 - 6)
          .attr("text-anchor", "middle")
          .style("font-size", (d) => `${Math.max(Math.min((d.x1 - d.x0) / 8, 14), 8)}px`)
          .style("fill", "white")
          .selectAll("tspan")
          .data((d) => {
            const boxWidth = d.x1 - d.x0;
            if (boxWidth < 40) return []; // 너무 작으면 아무것도 안 그림
            if (boxWidth < 60) return [d.data.name]; // 작으면 한 줄만
            return [d.data.name, `${d.data.value}%`]; // 넉넉하면 두 줄
          })
          .enter()
          .append("tspan")
          .attr("x", (d, i, nodes) => {
            const parent = d3.select(nodes[i].parentNode);
            return parent.attr("x");
          })
          .attr("dy", (d, i) => (i === 0 ? 0 : "1.2em"))
          .text((d) => d);

        g.on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`<strong>${d.data.name}</strong><br/>${d.data.value}%`)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 30 + "px");
          })
          .on("mousemove", function (event) {
            d3.select("#tooltip")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 30 + "px");
          })
          .on("mouseout", function () {
            d3.select("#tooltip").style("opacity", 0);
          });
        
        });
        
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Treemap;
