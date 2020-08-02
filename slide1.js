async function buildSlide1() {
  const slideId        = 's1'
  const lineIdPrefix   = slideId + 'line'
  const chartMarginTop = 50
  const flowImageSize  = 20
  
  // append the svg object to the body of the page
  var svg = d3.select('#' + slideId)
    .append('svg').attr('width', canvasWidth + canvasMargin.left + canvasMargin.right).attr('height', canvasHeight + canvasMargin.top + canvasMargin.bottom)
    .append('g').attr('transform', 'translate(' + canvasMargin.left + ',' + canvasMargin.top + ')')

  var dataFiles  = ['Nasa Co2 Ppm',      'Nasa Global Temp Change', 'Wgms Glacier Loss',     'Epa Global Mean Sea Level']
  var unit       = ['Parts per Million', 'Change\u00B0C',           'Thickness Loss Meters', 'Change inches']
  var colors     = ['Black',             tempColor,                 'DarkGray',               'DarkBlue']
  var sliceCount = [0,                   78,                        8,                       78]
  var chartCount = dataFiles.length
  var allData    = []
  var y          = []

  for (var i=0; i<dataFiles.length; ++i) {
	  allData[i] = await d3.csv('/data/' + dataFiles[i] + '.csv')
	  allData[i] = allData[i].slice(sliceCount[i])
  }

  var yearMins   = allData.map( data => d3.min(data, function(d) { return d.year; }))
  var yearMaxes  = allData.map( data => d3.max(data, function(d) { return d.year; }))

  //x-axes
  var yearsMinMax = [Math.min(...yearMins), Math.max(...yearMaxes)]
  var x = d3.scaleLinear().domain(yearsMinMax).range([ 0, canvasWidth ])


  var chartHeight    = (canvasHeight  - (chartMarginTop * (chartCount - 1)) )/chartCount
  for (var i=0; i<dataFiles.length; ++i) {
    
    var yTop       = chartHeight*(i+1) + (chartMarginTop * i)
    var yBottom    = chartHeight*(i) + (chartMarginTop * i)
    var data       = allData[i]
    var nameTokens = dataFiles[i].split(' ')
    var sourceName = nameTokens[0]
    var chartTitle = nameTokens.slice(1).join(' ') + ', ' + sourceName
    var chartColor = colors[i]

    //Chart title
    svg.append('text')
      .attr('x', canvasWidth/2)
      .attr('y', yBottom)
      .attr('dy', '1em')
      .attr('stroke', chartColor)
      .style('text-anchor', 'middle').text(chartTitle)
      
    //y-axis
    svg.append('g').attr('transform', 'translate(0,' + yTop + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));
    var dataMinMax = [d3.min(data, function(d) { return +d.value; }), d3.max(data, function(d) { return +d.value; })]
    y[i] = d3.scaleLinear().domain(dataMinMax).range([ yTop, yBottom ]);
    svg.append('g').call(d3.axisLeft(y[i]).ticks(5))      
    //y-axis label
    svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - canvasMargin.left + 10)
      .attr('x', 0 - yBottom - (chartHeight/2))
      .attr('dy', '0.1em')
      .style('font-size', '70%')
      .style("text-anchor", "middle").text(unit[i])

    //line
    svg.append('path')
      .datum(allData[i])
      .attr('class', 'line')
      .attr('id', lineIdPrefix + i)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2)
      .attr('stroke', chartColor)
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return y[i](+d.value) }))
      
    //image to next chart
    if (i != 0) {
	    svg.append('image')
	      .attr('href', 'images/red-arrow-down.png')
	      .attr('x', canvasWidth/2 - flowImageSize / 2)
	      .attr('y', yBottom - chartMarginTop/2)
	      .attr('width', flowImageSize)
	      .attr('height', flowImageSize)
    }
  }
}
