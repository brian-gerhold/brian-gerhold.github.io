async function buildSlide2(slideInfo) {
  const tooltipPointId          = slideInfo.id + 'tooltipPoint'
  const legendIdPrefix          = slideInfo.id + 'legend'

  function unselectedLineColor(index) { return index == 0 ? colors[index] : 'lightgrey' }
  function unselectedLineWidth(index) { return index == 0 ? 2 : 1 }
  function animationTime(index)       { return index == 0 ? 5000 : 2000 }
  function lineSelectId(index)        { return '#' + slideInfo.lineIdPrefix + index }
  function legendSelectId(index)      { return '#' + legendIdPrefix + index }
  
  function selectLine(index) {
    var color = colors[index]
    d3.select(lineSelectId(index)).style('stroke-width', 3).attr('stroke', color)
    d3.select(legendSelectId(index)).style('font-size', '110%').attr('stroke', color)
  }

  function unselectLine(index) {
    var color = unselectedLineColor(index)
    d3.select(lineSelectId(index)).style('stroke-width', unselectedLineWidth(index)).attr('stroke', color)
    d3.select(legendSelectId(index)).style('font-size', '100%').attr('stroke', color)  
  }

  function animateLine(index) {
    var lineId      = lineSelectId(index)
    var legendId    = legendSelectId(index)
    var preColor    = colors[index]
    var postColor   = unselectedLineColor(index, colors)
    var animateTime = animationTime(index)
    var totalLength = d3.select(lineId).node().getTotalLength();
    d3.select(lineId).style('opacity','1')
    d3.selectAll(lineId)
    d3.select(legendId).attr('stroke', preColor).transition().duration(animateTime).attr('stroke', postColor)
    d3.select(lineId)
      .style('opacity','1')
      .style('stroke-width', 4)
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .attr('stroke', preColor)
      .transition().duration(animateTime)
      .attr('stroke-dashoffset', 0)
      .attr('stroke', postColor)
      .style('stroke-width', unselectedLineWidth(index))
  }

  // append the svg object to the body of the page
  var svg = d3.select(jqEltId(slideInfo.id))
    .append('svg').attr('width', canvasWidth + canvasMargin.left + canvasMargin.right).attr('height', canvasHeight + canvasMargin.top + canvasMargin.bottom)
    .append('g').attr('transform', 'translate(' + canvasMargin.left + ',' + canvasMargin.top + ')')

  var dataFiles  = ['Nasa Global Temp Change', '1975 Broecker', '1981 Hansen', '1988 Hansen', '1990 Ipcc1',  '1995 Ipcc2', '2001 Ipcc3', '2007 Ipcc4',  '2013 Ipcc5']
  var colors     = [tempColor,                 'Indigo',        'SaddleBrown', 'Sienna',      'DarkBlue',    'MediumBlue', 'Blue',       'DeepSkyBlue', 'LightSkyBlue']
  var allData    = []
  
  for (var i=0; i<dataFiles.length; ++i) {
	  allData[i] = await d3.csv('/data/' + dataFiles[i] + '.csv')
  }
  
  allData[0]     = allData[0].slice(90)
  var yearMins   = allData.map( data => d3.min(data, function(d) { return d.year; }))
  var yearMaxes  = allData.map( data => d3.max(data, function(d) { return d.year; }))
  var deltaMins  = allData.map( data => d3.min(data, function(d) { return +d.value; }))
  var deltaMaxes = allData.map( data => d3.max(data, function(d) { return +d.value; }))

  //x-axis
  var yearsMinMax = [Math.min(...yearMins), Math.max(...yearMaxes)]
  var x = d3.scaleLinear().domain(yearsMinMax).range([ 0, canvasWidth ])
  svg.append('g').attr('transform', 'translate(0,' + canvasHeight + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));

  //y-axis
  var dataMinMax = [Math.min(...deltaMins) - 0.1, Math.max(...deltaMaxes)]
  var y = d3.scaleLinear().domain(dataMinMax).range([ canvasHeight, 0 ]);
  svg.append('g').call(d3.axisLeft(y))
  svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - canvasMargin.left)
    .attr("x",0 - (canvasHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style('font-size', '70%')
    .text('Global temperature change \u00B0C')

  //tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");  

  var tooltipPoint = svg.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('id', tooltipPointId).style('opacity', 0)
  
  for (var i=0; i<dataFiles.length; ++i) {
    var lineName = (i == 0 ? 'Actual' : dataFiles[i].substr(5) )
    //line
    svg.append('path')
      .datum(allData[i])
      .attr('class', 'line')
      .attr('id', slideInfo.lineIdPrefix + i)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', unselectedLineWidth(i))
      .attr('stroke', unselectedLineColor(i))
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return y(d.value) }))
      .on('mouseover', function(d) { selectLine(  parseLegendId(d3.select(this))) })
      .on('mouseout',  function(d) { unselectLine(parseLegendId(d3.select(this))) })

    //mouseover regions
    svg.selectAll('circles')
      .data(allData[i])
      .enter()
      .append('circle')
      .attr('cx', function(d) { return x(d.year) })      
      .attr('cy', function(d) { return y(d.value) })
      .attr('r', 10)
      .attr('id', function(d) { return i + '_' + d.i + '_' + slideInfo.mouseoverRegionIdSuffix })
      .style('opacity', 0)
      .on('mouseover', function(d) {
        var thisCircle = d3.select(this)
        var lineIndex = parseMouseOverId(thisCircle)
        
        tooltip.transition().delay(30).duration(200).style('opacity', 1);
        tooltip.html('<span>' + d.year + ':</span><br/><span>+' + d.value + '</span>').style('left', (x(d.year) + 50) + 'px').style("top", (y(d.value) - 20) + 'px').style('color', colors[lineIndex])
        tooltipPoint.attr('cx', thisCircle.attr('cx')).attr('cy', thisCircle.attr('cy'))
        tooltipPoint.transition().delay('20').duration('200').style('opacity', 1).style('fill', colors[lineIndex])    
        selectLine(lineIndex)
      })
      .on('mouseout', function(d) {
        var thisCircle = d3.select(this)
        var lineIndex = parseMouseOverId(thisCircle)
        tooltip.transition().duration(100).style('opacity', 0)
        tooltipPoint.transition().delay('20').duration('200').style('opacity', 0)
        unselectLine(lineIndex)
      })

    //legend
    svg.append('text')
      .attr('class', 'legend')
      .attr('id', legendIdPrefix + i)
      .attr('x', 20)
      .attr('y', 15 + i*20)
      .attr('stroke', unselectedLineColor(i))
      .text((i == 0 ? 'Actual' : 'Prediction: ' + dataFiles[i].substr(5)) + ', ' + dataFiles[i].substr(0,4))
      .on('mouseover', function(d) { selectLine(  parseLegendId(d3.select(this))) })
      .on('mouseout',  function(d) { unselectLine(parseLegendId(d3.select(this))) })
  }
  
  /*
  d3.selectAll('.line').style('opacity', '0')
  for (var i=0; i<dataFiles.length; ++i) {
    animateLine(i)
    await sleep(animationTime(i))
  }
  */
}
