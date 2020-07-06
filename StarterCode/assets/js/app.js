// @TODO: YOUR CODE HERE!
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.csv("assets/data/data.csv").then(function(data) {

    console.log(data);

    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
      });
    
    var xMin = d3.min(data, d => d.poverty)
    console.log(xMin)

    var xMax = d3.max(data, d => d.poverty)
    console.log(xMax)

    var yMin = d3.min(data, d => d.healthcare)
    console.log(yMin)

    var yMax = d3.max(data, d => d.healthcare)
    console.log(yMax)

    // Add X axis
    var x = d3.scaleLinear()
        .domain([xMin - 1, xMax + 1])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([yMin - 1, yMax + 1])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    var tooltip = d3.select("#scatter")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("font-size", "10px")

    var mousemove = function (d) {
        tooltip
            .html("Poverty: " + d.poverty + "<br/>" + "Healthcare: " + d.healthcare)
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
            .style("opacity", 0.5)
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function (d) {
        tooltip
            .transition()
            //.duration(200)
            .style("opacity", 0)
    }
    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.poverty); })
        .attr("cy", function (d) { return y(d.healthcare); })
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .style("opacity", .5)
        .style("stroke", "white")
        .on("mousemove", mousemove )
        .on("mouseleave", mouseleave )
        .on("mouseover", function (d) {
            d3.select(this).attr("r", 10).style("opacity", 1);
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("r", 7).style("opacity", .5);
        })
    
    svg.append('g')
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        // Add your code below this line
        .attr("x", function (d) { return x(d.poverty); })
        .attr("y", function (d) { return y(d.healthcare) + 2; })
        .text(function (d) { return (d.abbr); })
        .attr("font-size", "6px")
        .style("text-anchor", "middle")
        

})
  