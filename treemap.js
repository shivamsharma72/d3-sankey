import { Sankeys } from "./mysankey.js";

export const colors = d3
  .scaleOrdinal()
  .domain(["Vowels", "Consonants", "Punctuation"])
  .range(["#DFFFAB", "#FFC1CC", "#B2EBF2"]);
export const treemaps = (Mymap) => {
  drawtreemap(preparetreemapdata(Mymap));
  function preparetreemapdata(Mymap) {
    const vowels = [];
    const consonants = [];
    const punctuation = [];

    for (const char in Mymap) {
      const charData = Mymap[char];
      // console.log(`${char} - ${charData.type}`);
      const entry = { name: char, value: charData.count };
      if (charData.type === "vowel") {
        vowels.push(entry);
      } else if (charData.type === "consonant") {
        consonants.push(entry);
      } else if (charData.type === "punctuation") {
        punctuation.push(entry);
      }
    }

    // console.log(vowels.length);
    // console.log( consonants.length);
    // console.log( punctuation.length);

    const data = {
      name: "characters",
      children: [
        { name: "Vowels", children: vowels },
        { name: "Consonants", children: consonants },
        { name: "Punctuation", children: punctuation },
      ],
    };
    data.children = data.children.filter((group) => group.children.length > 0);
    return data;
  }

  function drawtreemap(data) {
    d3.select("#treemap_svg").selectAll("*").remove();
    const width = 580;
    const height = 400;
    const svg = d3
      .select("#treemap_svg")
      .attr("width", width)
      .attr("height", height);

    const root = d3.hierarchy(data).sum((d) => d.value);
    d3.treemap().size([width, height]).padding(2)(root);

    const treemaptooltip = d3
      .select("body")
      .append("div")
      .attr("class", "treemap-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("border-radius", "5px");
    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colors(d.parent.data.name))
      .attr("stroke", "black")
      .attr("class", (d) => `char-${d.data.name}`)
      .on("mouseover", function (event, d) {
        d3.select(this).style("stroke-width", "8px").style("stroke", "#ff6b6b");
        d3.selectAll(`.sankey-node-${d.data.name}`)
          .transition()
          .duration(200)
          .attr("stroke-width", "8px")
          .attr("stroke", "#ff6b6b");
        treemaptooltip
          .style("visibility", "visible")
          .style("opacity", 1)
          .text(`character: ${d.data.name}, count: ${d.data.value}`);
      })
      .on("mousemove", function (event) {
        treemaptooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).style("stroke-width", "1px").style("stroke", "black");
        d3.selectAll(`.sankey-node-${d.data.name}`)
          .transition()
          .duration(200)
          .attr("stroke-width", "1px")
          .attr("stroke", "black");
        treemaptooltip.style("visibility", "hidden").style("opacity", 0);
      })
      .on("click", (event, d) => {
        Sankeys(Mymap, d.data.name);
      });

    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("font-family", "'IBM Plex Sans', sans-serif")
      .style("font-size", "15px")
      .style("fill", "black");
  }
  return preparetreemapdata(Mymap);
};

export const mycolors = () => colors;
