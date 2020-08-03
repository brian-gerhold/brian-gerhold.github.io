async function buildSlide3() {
  const chartMarginTop = 50

  var dataFiles   = ['Epa Sulphur Dioxide Ppb', 'Wmo Ozone Depleting Emissions', 'Noaa Median Global Temp Change Prediction']
  var units       = ['So2 Parts per Billion',   '1K Metric Tons',                'Change\u00B0C']
  var colors      = ['DarkGreen',               'Green',                         tempColor]
  var sliceCounts = [0,                         0,                               0]
  var chartCount  = dataFiles.length
  
  await populateDataObjs(slideInfo, dataFiles, colors, sliceCounts)
  for (var i=0; i<chartCount; ++i) { slideInfo.dataObjs[i].unit   = units[i] }

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
    slideInfo.dataObjs[i].x = d3.scaleLinear().domain([slideInfo.dataObjs[i].minYear, slideInfo.dataObjs[i].maxYear]).range([ 0, canvasWidth ])
    slideInfo.svg.append('g').attr('transform', 'translate(0,' + yTop + ')').call(d3.axisBottom(slideInfo.dataObjs[i].x).tickFormat(d3.format('d')))

    //y-axis
    var dataMinMax = [d3.min(data, function(d) { return +d.value; }), d3.max(data, function(d) { return +d.value; })]
    if (i == 1) dataMinMax[1] = dataMinMax[1] + 300 
    slideInfo.dataObjs[i].y = d3.scaleLinear().domain(dataMinMax).range([ yTop, yBottom ]);
    slideInfo.svg.append('g').call(d3.axisLeft(slideInfo.dataObjs[i].y).ticks(5))      
    //y-axis label
    slideInfo.svg.append('text').attr('transform', 'rotate(-90)').attr("y", yLabelX)
      .attr('x', 0 - yBottom - (chartHeight/2))
      .attr('dy', '0.1em')
      .style('font-size', '70%')
      .style('text-anchor', 'middle').text(slideInfo.dataObjs[i].unit)
      
    if (i == 0) {
      var eventYear = 1990
      slideInfo.svg.append('rect')
        .attr('width',  2)
        .attr('height', yTop - yBottom - 49)
        .attr('x',      slideInfo.dataObjs[i].x(eventYear))
        .attr('y',      yBottom + 49)
        .attr('fill',   'DarkGray')
      slideInfo.svg.append('text')
        .attr('stroke', chartColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 40)
        .attr('y', yTop - 30)
        .style('font-size', '70%')
        .text('1990: Acid Rain')
      slideInfo.svg.append('text')
        .attr('stroke', chartColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 30)
        .attr('y', yTop - 18)
        .style('font-size', '70%')
        .text('Legistlation')
    }
    else if (i ==1) {
      var eventYear = 1989
      slideInfo.svg.append('rect')
        .attr('width',  2)
        .attr('height', yTop - yBottom - 46)
        .attr('x',      slideInfo.dataObjs[i].x(eventYear))
        .attr('y',      yBottom + 46)
        .attr('fill',   'DarkGray')
      slideInfo.svg.append('text')
        .attr('stroke', chartColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 40)
        .attr('y', yTop - 30)
        .style('font-size', '70%')
        .text('1989: Montreal Protocol')
      slideInfo.svg.append('text')
        .attr('stroke', chartColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 20)
        .attr('y', yTop - 18)
        .style('font-size', '70%')
        .text('takes effect')	
    }
    else {
        var eventYear = 2060
        slideInfo.svg.append('text')
          .attr('stroke', chartColor)
          .attr('x', slideInfo.dataObjs[i].x(eventYear) - 40)
          .attr('y', yTop - 30)
          .style('font-size', '70%')
          .text('Will we respond')
        slideInfo.svg.append('text')
          .attr('stroke', chartColor)
          .attr('x', slideInfo.dataObjs[i].x(eventYear) - 20)
          .attr('y', yTop - 18)
          .style('font-size', '70%')
          .text('in time?')	    	
    }
  }

  addSlideTitle(slideInfo, 'Other Emmissions Regulations Proved Very Effective', 225)
  addDataLines(slideInfo, true)
  addMouseOverEffects(slideInfo)
}