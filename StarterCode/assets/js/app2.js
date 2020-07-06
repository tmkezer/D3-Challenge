var svgWidth = 600;
var svgHeight = 400;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]) - 1)

  return textGroup;
}

//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //poverty
  if (chosenXAxis === 'poverty') {
    return `${value}%`;
  }
  //household income
  else if (chosenXAxis === 'income') {
    return `${value}`;
  }
  else {
    return `${value}`;
  }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  // X labels
  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty:";
  }
  else if (chosenXAxis === "income") {
    xlabel = "Income:"
  }
  else {
    xlabel = "Age:";
  }
  console.log(xlabel)
  // Y labels
  console.log(chosenYAxis)
  if (chosenYAxis === "healthcare") {
    ylabel = "Without Healthcare:";
  }
  else if (chosenYAxis === "obesity") {
    ylabel = "Obesity:"
  }
  else {
    ylabel = "Smokers:";
  }
  console.log(ylabel)



  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("font-size", "10px")
    .offset([0, 75])
    .html(function (d) {
      return (`<b>${d.state}</b><br>${xlabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip
      .show(data)
      .style("opacity", 0.75)
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip
        .hide(data)
        .style("opacity", 0)
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function (healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function (data) {
    //data.state = +data.state;
    //data.abbr = +data.abbr;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append('g')
    .classed('y-axis', true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 5)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  var textGroup = chartGroup.selectAll('.stateText')
    .data(healthData)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]) - 1)
    .attr('dy', 3)
    .attr('font-size', '5px')
    .text(function (d) { return d.abbr });

  // Create group for two x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'poverty')
    .text('In Poverty (%)');

  var ageLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'age')
    .text('Age (Median)');

  var incomeLabel = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'income')
    .text('Household Income (Median)')

  //create a group for Y labels
  var yLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

  var healthcareLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 0 - 20)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'healthcare')
    .text('Without Healthcare (%)');

  var smokesLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 40)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'smokes')
    .text('Smoker (%)');

  var obesityLabel = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 60)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'obesity')
    .text('Obese (%)');

  // updateToolTip function above csv import
 //update the toolTip
 var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

 //x axis event listener
 xLabelsGroup.selectAll('text')
   .on('click', function() {
     var value = d3.select(this).attr('value');

     if (value != chosenXAxis) {

       //replace chosen x with a value
       chosenXAxis = value; 

       //update x for new data
       xLinearScale = xScale(healthData, chosenXAxis);

       //update x 
       xAxis = renderXAxis(xLinearScale, xAxis);

       //upate circles with a new x value
       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update text 
       textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

       //update tooltip
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       //change of classes changes text
       if (chosenXAxis === 'poverty') {
         povertyLabel.classed('active', true).classed('inactive', false);
         ageLabel.classed('active', false).classed('inactive', true);
         incomeLabel.classed('active', false).classed('inactive', true);
       }
       else if (chosenXAxis === 'age') {
         povertyLabel.classed('active', false).classed('inactive', true);
         ageLabel.classed('active', true).classed('inactive', false);
         incomeLabel.classed('active', false).classed('inactive', true);
       }
       else {
         povertyLabel.classed('active', false).classed('inactive', true);
         ageLabel.classed('active', false).classed('inactive', true);
         incomeLabel.classed('active', true).classed('inactive', false);
       }
     }
   });
 //y axis lables event listener
 yLabelsGroup.selectAll('text')
   .on('click', function() {
     var value = d3.select(this).attr('value');

     if(value !=chosenYAxis) {
         //replace chosenY with value  
         chosenYAxis = value;

         //update Y scale
         yLinearScale = yScale(healthData, chosenYAxis);

         //update Y axis 
         yAxis = renderYAxis(yLinearScale, yAxis);

         //Udate CIRCLES with new y
         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

         //update TEXT with new Y values
         textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

         //update tooltips
         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

         //Change of the classes changes text
         if (chosenYAxis === 'obesity') {
           obesityLabel.classed('active', true).classed('inactive', false);
           smokesLabel.classed('active', false).classed('inactive', true);
           healthcareLabel.classed('active', false).classed('inactive', true);
         }
         else if (chosenYAxis === 'smokes') {
           obesityLabel.classed('active', false).classed('inactive', true);
           smokesLabel.classed('active', true).classed('inactive', false);
           healthcareLabel.classed('active', false).classed('inactive', true);
         }
         else {
           obesityLabel.classed('active', false).classed('inactive', true);
           smokesLabel.classed('active', false).classed('inactive', true);
           healthcareLabel.classed('active', true).classed('inactive', false);
         }
       }
     });
});