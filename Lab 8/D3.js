// Set up dimensions
const width = 800;
const height = 600;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

// Create SVG
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a group for the map
const g = svg.append("g");

// Create a projection
const projection = d3.geoMercator()
    .scale(1500)
    .center([106, 16])
    .translate([width / 2, height / 2]);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Create tooltip
const tooltip = d3.select(".tooltip");

// Load and process data
Promise.all([
    d3.json("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces.json"),
    d3.csv("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces-data.csv")
]).then(([geoData, provinceData]) => {
    // Create sample COVID-19 data
    const covidData = provinceData.map(d => ({
        name: d.name,
        cases: Math.floor(Math.random() * 1000), // Random number of cases between 0 and 999
        population: +d.population,
        area: +d.area
    }));

    // Create a color scale
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(covidData, d => d.cases)]);

    // Draw map
    g.selectAll("path")
        .data(geoData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const province = covidData.find(p => p.name === d.properties.Name);
            return province ? colorScale(province.cases) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            const province = covidData.find(p => p.name === d.properties.Name);
            if (province) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`
                    <strong>${d.properties.Name}</strong><br/>
                    Population: ${province.population.toLocaleString()}<br/>
                    COVID-19 Cases: ${province.cases.toLocaleString()}<br/>
                    Area: ${province.area.toLocaleString()} km²
                `)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Add labels for provinces
    g.selectAll("text")
        .data(geoData.features)
        .enter().append("text")
        .attr("transform", d => `translate(${path.centroid(d)})`)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-size", "8px")
        .style("fill", "black")
        .text(d => {
            const province = covidData.find(p => p.name === d.properties.Name);
            return province ? province.cases : "";
        });

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        g.attr("transform", event.transform);
    }

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Vietnam COVID-19 Cases by Province");

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - legendWidth - margin.right}, ${height - margin.bottom - legendHeight})`);

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".0f"));

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);

    const defs = svg.append("defs");
    const legendGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    legendGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
});