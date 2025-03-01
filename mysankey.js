import { mycolors } from "./treemap.js";

export const Sankeys = (myMap, currchar) => {
  const colorScale = mycolors();
  const sankeydata = parsedata(myMap, currchar);

  if (
    sankeydata &&
    sankeydata.nodes.length > 0 &&
    sankeydata.links.length > 0
  ) {
    // console.log( sankeydata.nodes.length);
    // console.log("links" sankeydata.links.length);
    drawSankey(sankeydata, currchar);
  } else {
    // console.log("no data found for char:", currchar);
    d3.select("#sankey_svg").selectAll("*").remove();
  }

  function parsedata(myMap, currchar) {
    // console.log("checking transitions ");
    // console.log("in transitions:", myMap[currchar]?.intransition);
    // console.log("out transitions:", myMap[currchar]?.outtransition);

    const currcharData = myMap[currchar];
    if (!currcharData) return null;
    const nodes = [];
    const links = [];
    const nodeIndices = new Map();
    let currentIndex = 0;

    //  middle coloummn
    nodes.push({ name: currchar, column: 1 });
    nodeIndices.set(currchar + "_mid", currentIndex++);

    // this is for left column
    Object.entries(currcharData.intransition).forEach(([char, transition]) => {
      if (char !== currchar && transition.count > 0) {
        const nodeKey = char + "_left";
        if (!nodeIndices.has(nodeKey)) {
          nodes.push({ name: char, column: 0 });
          nodeIndices.set(nodeKey, currentIndex++);
        }
        links.push({
          source: nodeIndices.get(nodeKey),
          target: nodeIndices.get(currchar + "_mid"),
          value: transition.count,
        });
      }
    });

    // add nodes and linking it for right column
    Object.entries(currcharData.outtransition).forEach(([char, transition]) => {
      if (char !== currchar && transition.count > 0) {
        const nodeKey = char + "_right";
        if (!nodeIndices.has(nodeKey)) {
          nodes.push({ name: char, column: 2 });
          nodeIndices.set(nodeKey, currentIndex++);
        }
        links.push({
          source: nodeIndices.get(currchar + "_mid"),
          target: nodeIndices.get(nodeKey),
          value: transition.count,
        });
      }
    });

    return { nodes, links };
  }

  function getCharType(char) {
    const charData = myMap[char];

    if (charData) {
      switch (charData.type) {
        case "vowel":
          return "Vowels";
        case "consonant":
          return "Consonants";
        case "punctuation":
          return "Punctuation";
      }
    }
    return null;
  }

  function getNodeColor(nodeName) {
    const type = getCharType(nodeName);
    return type ? colorScale(type) : "#888";
  }

  function drawSankey(data, currchar) {
    d3.select("#sankey_svg").selectAll("*").remove();
    d3.select("#flow_label").text(`Character flow for '${currchar}'`);

    const width = 580;
    const height = 400;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const svg = d3
      .select("#sankey_svg")
      .attr("width", width)
      .attr("height", height);
    const sankey = d3
      .sankey()
      .nodeWidth(30)
      .nodePadding(20)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    const sankeydata = sankey(data);

    const sankeytooltip = d3
      .select("body")
      .append("div")
      .attr("class", "sankey-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("z-index", "10");

    svg
      .append("g")
      .selectAll("path")
      .data(sankeydata.links)
      .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", "#aaa")
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .on("mouseover", function (event, d) {
        sankeytooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("visibility", "visible");

        if (d.source.name === currchar) {
          sankeytooltip.html(
            `Character '${currchar}' flows into '${d.target.name}' ${d.value} times`
          );
        } else {
          sankeytooltip.html(
            `Character '${d.source.name}' flows into '${currchar}' ${d.value} times`
          );
        }
        sankeytooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        sankeytooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .style("visibility", "hidden");
      });

    const nodes = svg
      .append("g")
      .selectAll("g")
      .data(sankeydata.nodes)
      .join("g");

    // nodes with tooltip
    nodes
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => getNodeColor(d.name))
      .attr("stroke", "#000")
      .attr("class", (d) => `sankey-node-${d.name}`)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", "6px")
          .attr("stroke", "#ff6b6b");

        svg
          .selectAll("path")
          .filter((l) => l.source === d || l.target === d)
          .transition()
          .duration(200)
          .attr("stroke", "#ff6b6b")
          .attr("opacity", 0.8)
          .attr("stroke-width", (l) => Math.max(2, l.width + 2));

        d3.selectAll(`.char-${d.name}`)
          .transition()
          .duration(200)
          .style("stroke-width", "6px")
          .style("stroke", "#ff6b6b");

        sankeytooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("visibility", "visible");

        sankeytooltip
          .html(`Character '${d.name}' appears ${d.value} times`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", "1px")
          .attr("stroke", "black");

        svg
          .selectAll("path")
          .transition()
          .duration(200)
          .attr("stroke", "#aaa")
          .attr("opacity", 0.5)
          .attr("stroke-width", (l) => Math.max(1, l.width));

        d3.selectAll(`.char-${d.name}`)
          .transition()
          .duration(200)
          .style("stroke-width", "1px")
          .style("stroke", "black");

        sankeytooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .style("visibility", "hidden");
      });

    // addin labels to nodes
    nodes
      .append("text")
      .attr("x", (d) => (d.column === 0 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.column === 0 ? "start" : "end"))
      .text((d) => d.name)
      .style("font-family", "'IBM Plex Sans', sans-serif")
      .style("font-size", "12px")
      .style("fill", "black");
  }
};
