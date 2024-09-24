// Set up dimensions
const margin = {top: 30, right: 120, bottom: 50, left: 150},
width = 1200 - margin.left - margin.right,
height = 2000 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("https://tungth.github.io/data/vn-provinces-data.csv").then(function(data) {
// Convert GRDP-VND to number and rename to GDP
data = data.map(d => ({
    name: d.province,
    GDP: parseFloat(d["GRDP-VND"].replace(/["']/g, "").replace(",", "."))
})).filter(d => !isNaN(d.GDP));

// Set up scales
const x = d3.scaleLinear()
    .range([0, width]);

const y = d3.scaleBand()
    .range([0, height])
    .padding(0.1);

// Color scale
const color = d3.scaleThreshold()
    .domain([50, 100, 150])
    .range(["#ffd700", "#ffa500", "#ff0000", "#800000"]);

function updateChart(data) {
    // Update domains
    x.domain([0, d3.max(data, d => d.GDP)]);
    y.domain(data.map(d => d.name));

    // Update bars
    const bars = svg.selectAll(".bar")
        .data(data, d => d.name);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .merge(bars)
        .transition()
        .duration(750)
        .attr("x", 0)
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.GDP))
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.GDP));

    bars.exit().remove();

    // Update x-axis
    svg.selectAll(".x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Update y-axis
    svg.selectAll(".y-axis").remove();
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    // Update labels
    const labels = svg.selectAll(".label")
        .data(data, d => d.name);

    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("dy", "0.32em")
        .merge(labels)
        .transition()
        .duration(750)
        .attr("x", d => x(d.GDP) + 5)
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .text(d => d.GDP.toFixed(2));

    labels.exit().remove();
}

// Initial chart
updateChart(data);

// Sorting functionality
d3.select("#sort-select").on("change", function() {
    const sortValue = this.value;
    data.sort((a, b) => {
        if (sortValue === "name") {
            return d3.ascending(a.name, b.name);
        } else {
            return d3.descending(a.GDP, b.GDP);
        }
    });
    updateChart(data);
});
});