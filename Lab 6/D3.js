// Function to create the red plot
function createRedPlot() {
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};

    const svg = d3.select("#red-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Generate some random data
    const data = Array.from({ length: 200 }, () => ({
        x: Math.random() * 340 - 178,
        y: Math.random() * 140 - 72,
        cases: Math.random() * 1000
    }));

    const xScale = d3.scaleLinear()
        .domain([-178, 162])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([-72, 68])
        .range([height, 0]);

    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.cases)])
        .range([2, 10]);

    const opacityScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.cases)])
        .range([0.3, 1]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height / 2})`)
        .call(d3.axisBottom(xScale));

    // Add Y axis
    svg.append("g")
        .attr("transform", `translate(${width / 2},0)`)
        .call(d3.axisLeft(yScale));

    // Add circles
    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y))
        .attr("r", d => sizeScale(d.cases))
        .attr("fill", "red")
        .attr("opacity", d => opacityScale(d.cases));

    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("O");

    svg.append("text")
        .attr("x", width)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Longitude");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("text-anchor", "middle")
        .text("Latitude");

    // Add India label
    svg.append("text")
        .attr("x", xScale(80))
        .attr("y", yScale(20))
        .attr("text-anchor", "middle")
        .text("India");

    // Brush feature
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush", brushed);

    svg.append("g")
        .call(brush);

    function brushed({selection}) {
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;
        circles.classed("selected", d =>
            x0 <= xScale(d.x) && xScale(d.x) <= x1 &&
            y0 <= yScale(d.y) && yScale(d.y) <= y1
        );
    }
}

// Function to create the blue plot with brush
function createBluePlot() {
    const width = 800;
    const height = 500;
    const margin = {top: 20, right: 30, bottom: 30, left: 40};

    const svg = d3.select("#blue-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // Load data
    const dataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    
    d3.csv(dataUrl).then(data => {
        const date = "5/4/20";  // Column for May 4, 2020
        const filteredData = data.map(d => ({
            country: d['Country/Region'],
            lat: +d.Lat,
            long: +d.Long,
            cases: +d[date] || 0
        })).filter(d => d.cases > 0);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.long))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.lat))
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(filteredData, d => d.cases)])
            .range([2, 30]);

        const opacityScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.cases)])
            .range([0.3, 1]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Add Y axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add circles
        const circles = svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.long))
            .attr("cy", d => yScale(d.lat))
            .attr("r", d => sizeScale(d.cases))
            .attr("fill", "steelblue")
            .attr("opacity", d => opacityScale(d.cases))
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                    .html(`Country: ${d.country}<br>Cases: ${d.cases}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });

        // Brush feature
        const brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("start brush", brushed);

        svg.append("g")
            .call(brush);

        function brushed({selection}) {
            if (!selection) return;

            const [[x0, y0], [x1, y1]] = selection;
            circles.classed("selected", d =>
                x0 <= xScale(d.long) && xScale(d.long) <= x1 &&
                y0 <= yScale(d.lat) && yScale(d.lat) <= y1
            );
        }
    });
}

// Create both plots
createRedPlot();
createBluePlot();
