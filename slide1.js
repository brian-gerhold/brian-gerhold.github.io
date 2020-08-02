async function buildSlide1(slideInfo) {
  const chartMarginTop = 50
  const flowImageSize  = 20

  var dataFiles   = ['Nasa Co2 Ppm',      'Nasa Global Temp Change', 'Wgms Glacier Loss',     'Epa Global Mean Sea Level']
  var units       = ['Parts per Million', 'Change\u00B0C',           'Thickness Loss Meters', 'Change inches']
  var colors      = ['Black',             tempColor,                 'DarkGray',               'DarkBlue']
  var sliceCounts = [0,                   78,                        8,                       78]
  var chartCount  = dataFiles.length
  
  await populateDataObjs(slideInfo, dataFiles, colors, sliceCounts)
  for (var i=0; i<chartCount; ++i) { slideInfo.dataObjs[i].unit   = units[i] }

  //x-axes
  var x = d3.scaleLinear().domain([slideInfo.minYear, slideInfo.maxYear]).range([ 0, canvasWidth ])

  var chartHeight = (canvasHeight  - (chartMarginTop * (chartCount - 1)) )/chartCount
  for (var i=0; i<chartCount; ++i) {
    var yTop       = chartHeight*(i+1) + (chartMarginTop * i)
    var yBottom    = chartHeight*(i) + (chartMarginTop * i)
    var data       = slideInfo.dataObjs[i].values
    var nameTokens = dataFiles[i].split(' ')
    var sourceName = nameTokens[0]
    var chartTitle = nameTokens.slice(1).join(' ') + ', ' + sourceName
    var chartColor = slideInfo.dataObjs[i].color

    //Chart title
    slideInfo.svg.append('text')
      .attr('x', canvasWidth/2)
      .attr('y', yBottom)
      .attr('dy', '1em')
      .attr('stroke', chartColor)
      .style('text-anchor', 'middle').text(chartTitle)

    //x-axis
    slideInfo.svg.append('g').attr('transform', 'translate(0,' + yTop + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')))
    slideInfo.dataObjs[i].x = x

    //y-axis
    var dataMinMax = [d3.min(data, function(d) { return +d.value; }), d3.max(data, function(d) { return +d.value; })]
    slideInfo.dataObjs[i].y = d3.scaleLinear().domain(dataMinMax).range([ yTop, yBottom ]);
    slideInfo.svg.append('g').call(d3.axisLeft(slideInfo.dataObjs[i].y).ticks(5))      
    //y-axis label
    slideInfo.svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - canvasMargin.left + 10)
      .attr('x', 0 - yBottom - (chartHeight/2))
      .attr('dy', '0.1em')
      .style('font-size', '70%')
      .style('text-anchor', 'middle').text(slideInfo.dataObjs[i].unit)

    //image to next chart
    if (i != 0) {
	    slideInfo.svg.append('image')
	      .attr('href', 'images/red-arrow-down.png')
	      .attr('x', canvasWidth/2 - flowImageSize / 2)
	      .attr('y', yBottom - chartMarginTop/2)
	      .attr('width', flowImageSize)
	      .attr('height', flowImageSize)
    }
  }

  addDataLines(slideInfo)
  addMouseOverEffects(slideInfo)
}
