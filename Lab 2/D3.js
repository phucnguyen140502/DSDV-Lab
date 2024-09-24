// Part 1
// Utility function to add an element to SVG
function addEltToSVG(svg, name, attrs) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs === undefined) attrs = {};
    for (var key in attrs) {
        element.setAttributeNS(null, key, attrs[key]);
    }
    svg.appendChild(element);
}

// Function to create the histogram
function createHistogram(svg, str) {
    // Initialize the bins for the ranges A-D, E-H, I-L, M-P, Q-U, V-Z
    const bins = [0, 0, 0, 0, 0, 0];

    // Convert string to uppercase to handle both lowercase and uppercase letters
    str = str.toUpperCase();

    // Count characters in each bin
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (char >= 'A' && char <= 'D') {
            bins[0]++;
        } else if (char >= 'E' && char <= 'H') {
            bins[1]++;
        } else if (char >= 'I' && char <= 'L') {
            bins[2]++;
        } else if (char >= 'M' && char <= 'P') {
            bins[3]++;
        } else if (char >= 'Q' && char <= 'U') {
            bins[4]++;
        } else if (char >= 'V' && char <= 'Z') {
            bins[5]++;
        }
    }

    // Define the width of each bar and the starting position
    const barWidth = 50;
    const maxHeight = 400;

    // Create bars in the histogram
    for (let i = 0; i < bins.length; i++) {
        let binHeight = bins[i] * 50; // Each letter contributes 50 pixels of height
        if (binHeight === 0) binHeight = 1; // Ensure empty bins are visible

        // Add a rectangle (bar) to represent the count in the current bin
        addEltToSVG(svg, 'rect', {
            x: i * barWidth + 10, // Positioning the bars
            y: maxHeight - binHeight, // The top of the bar
            width: barWidth - 5, // Bar width with some padding
            height: binHeight, // Bar height based on character count
            fill: "blue", // Bar color
            stroke: "black" // Bar outline
        });
    }
}

window.onload = function() {
    const svg = document.getElementById('histogram');
    createHistogram(svg, "Phuc");
};

// Part 2
// Generate a random dataset of 20 values between 1 and 100
const dataset = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));

// Function to draw the bar chart using D3.js
function drawBarChart(data) {
    const svgWidth = 600;
    const svgHeight = 400;
    const barPadding = 5;
    const barWidth = svgWidth / data.length;

    // Remove any previous content from the SVG
    d3.select("#barChart").selectAll("*").remove();

    const svg = d3.select("#barChart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Scale for the bar heights
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([0, svgHeight - 20]);

    // Color scale for the bars
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range(["lightblue", "blue"]);

    // Create bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * barWidth)
        .attr("y", d => svgHeight - yScale(d)) // Y position depends on height
        .attr("width", barWidth - barPadding)
        .attr("height", d => yScale(d)) // Height depends on data value
        .attr("fill", d => colorScale(d));

    // Add labels to each bar
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * barWidth + (barWidth - barPadding) / 2)
        .attr("y", d => svgHeight - yScale(d) - 5) // Positioning label above bar
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d); // Display the value of the bar
}

// Call the function to draw the chart
drawBarChart(dataset);

function drawD3Histogram(data) {
    const svgWidth = 600;
    const svgHeight = 450;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Remove any previous content from the SVG
    d3.select("#histogram-d3").selectAll("*").remove();

    const svg = d3.select("#histogram-d3")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the bin generator
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(10));

    const bins = histogram(data);

    // Y scale
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(bins, d => d.length)]).nice();

    // Create bars
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => height - y(d.length))
        .attr("fill", "steelblue");

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d => d % 10 === 0 ? d : '')) // Only show every 10th tick label
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dy", "1em");

    // Add the y-axis with vertical labels
    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(5) // Adjust the number of ticks as needed
            .tickFormat(d3.format("d"))); // Use integer format for y-axis labels

    // Add x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Value");

    // Add y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Frequency");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Histogram of Random Data");
}

drawD3Histogram(dataset);
