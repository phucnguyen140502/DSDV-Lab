const margin = {top: 50, right: 50, bottom: 50, left: 50};
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// SVG setup
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);
const areaScale = d3.scaleSqrt(); // To map province area to circle size
const colorScale = d3.scaleSequential(d3.interpolateCool); // Color by density (using a smooth color gradient)

// Axis generators
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Load the data
d3.csv("https://tungth.github.io/data/vn-provinces-data.csv", rowConverter)
    .then(data => {
    your_draw_chart_function(data);
    });

// Convert data types
function rowConverter(d) {
    return {
    province: d.province,
    population: +d.population,
    grpd_vnd: +d.grpd_vnd,
    area: +d.area,
    density: +d.density
    };
}

// Main chart drawing function
function your_draw_chart_function(data) {
    // Set scale domains
    xScale.domain([0, d3.max(data, d => d.population)]);
    yScale.domain([0, d3.max(data, d => d.grpd_vnd)]);
    areaScale.domain([0, d3.max(data, d => d.area)]).range([0, 20]); // Smaller circle sizes
    colorScale.domain([0, d3.max(data, d => d.density)]); // Color gradient based on density

    // Draw x-axis
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis)
    .append("text")
    .attr("x", width)
    .attr("y", -10)
    .attr("fill", "black")
    .style("text-anchor", "end")
    .text("Population (millions)");

    // Draw y-axis
    svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("transform", "rotate(-90)")
    .attr("fill", "black")
    .style("text-anchor", "end")
    .text("GRPD-VND (million VND/person/year)");

    // Draw circles
    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.population))
    .attr("cy", d => yScale(d.grpd_vnd))
    .attr("r", d => areaScale(d.area)) // Circle size proportional to area
    .attr("fill", d => colorScale(d.density))
    .attr("opacity", 0.8);

    // Add tooltips for better user experience
    svg.selectAll("circle")
    .append("title")
    .text(d => `${d.province}: Population=${d.population}, GRPD-VND=${d.grpd_vnd}, Area=${d.area}, Density=${d.density}`);
}