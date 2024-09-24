// Set up dimensions and margins
const margin = {top: 50, right: 150, bottom: 50, left: 60};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart-container")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv").then(function(data) {
const countries = ["Vietnam", "US", "France", "Italy"];
const parseDate = d3.timeParse("%m/%d/%y");

// Transpose and filter data
const processedData = countries.flatMap(country => {
const countryData = data.find(d => d["Country/Region"] === country);
return Object.entries(countryData)
    .filter(([key, _]) => parseDate(key))
    .map(([date, cases]) => ({
    country: country,
    date: parseDate(date),
    cases: +cases
    }));
}).filter(d => d.date >= parseDate("4/1/20") && d.date <= parseDate("5/1/20"));

// Group data by country
const nestedData = d3.group(processedData, d => d.country);

// Set up scales
const x = d3.scaleTime()
.domain(d3.extent(processedData, d => d.date))
.range([0, width]);

const y = d3.scaleLinear()
.domain([0, d3.max(processedData, d => d.cases)])
.range([height, 0]);

const color = d3.scaleOrdinal()
.domain(countries)
.range(d3.schemeCategory10);

// Add X axis
svg.append("g")
.attr("transform", `translate(0,${height})`)
.call(d3.axisBottom(x));

// Add Y axis
svg.append("g")
.call(d3.axisLeft(y));

// Add lines
const line = d3.line()
.x(d => x(d.date))
.y(d => y(d.cases));

svg.selectAll(".line")
.data(nestedData)
.join("path")
    .attr("class", "line")
    .attr("d", ([_, values]) => line(values))
    .attr("stroke", ([country, _]) => color(country));

// Add tooltip
const tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// Add invisible rectangles for mouse events
const mouseG = svg.append("g")
.attr("class", "mouse-over-effects");

mouseG.append("path")
.attr("class", "mouse-line")
.style("stroke", "black")
.style("stroke-width", "1px")
.style("opacity", "0");

const mousePerLine = mouseG.selectAll(".mouse-per-line")
.data(nestedData)
.join("g")
.attr("class", "mouse-per-line");

mousePerLine.append("circle")
.attr("r", 7)
.style("stroke", ([country, _]) => color(country))
.style("fill", "none")
.style("stroke-width", "1px")
.style("opacity", "0");

mouseG.append("rect")
.attr("width", width)
.attr("height", height)
.attr("fill", "none")
.attr("pointer-events", "all")
.on("mouseout", () => {
    d3.select(".mouse-line").style("opacity", "0");
    d3.selectAll(".mouse-per-line circle").style("opacity", "0");
    tooltip.style("opacity", 0);
})
.on("mouseover", () => {
    d3.select(".mouse-line").style("opacity", "1");
    d3.selectAll(".mouse-per-line circle").style("opacity", "1");
    tooltip.style("opacity", 0.9);
})
.on("mousemove", function(event) {
    const mouse = d3.pointer(event);
    d3.select(".mouse-line")
    .attr("d", `M${mouse[0]},${height} ${mouse[0]},0`);

    d3.selectAll(".mouse-per-line")
    .attr("transform", function([country, values]) {
        const xDate = x.invert(mouse[0]);
        const bisect = d3.bisector(d => d.date).left;
        const idx = bisect(values, xDate);
        const d0 = values[idx - 1];
        const d1 = values[idx];
        const d = xDate - d0.date > d1.date - xDate ? d1 : d0;
        return `translate(${x(d.date)},${y(d.cases)})`;
    });

    tooltip.html(() => {
    const xDate = x.invert(mouse[0]);
    let content = `<strong>Date: ${xDate.toLocaleDateString()}</strong><br>`;
    nestedData.forEach(([country, values]) => {
        const bisect = d3.bisector(d => d.date).left;
        const idx = bisect(values, xDate);
        const d = values[idx];
        content += `${country}: ${d.cases.toLocaleString()}<br>`;
    });
    return content;
    })
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
});

// Add legend
const legend = svg.selectAll(".legend")
.data(countries)
.join("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

legend.append("rect")
.attr("x", width + 10)
.attr("width", 18)
.attr("height", 18)
.style("fill", color);

legend.append("text")
.attr("x", width + 35)
.attr("y", 9)
.attr("dy", ".35em")
.style("text-anchor", "start")
.text(d => d);

// Add interactivity to legend
legend.on("mouseover", function(event, d) {
const selectedCountry = d;
svg.selectAll(".line")
    .transition()
    .duration(200)
    .style("opacity", ([country, _]) => country === selectedCountry ? 1 : 0.1);
})
.on("mouseout", function(event, d) {
svg.selectAll(".line")
    .transition()
    .duration(200)
    .style("opacity", 1);
});
});