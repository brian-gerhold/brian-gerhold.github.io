async function buildSlide2(slideInfo) {
  const tooltipPointId          = slideInfo.id + 'tooltipPoint'
  const legendIdPrefix          = slideInfo.id + 'legend'

  function unselectedLineColor(index) { return index == 0 ? colors[index] : 'lightgrey' }
  function unselectedLineWidth(index) { return index == 0 ? 2 : 1 }
  function animationTime(index)       { return index == 0 ? 5000 : 2000 }
  function lineSelectId(index)        { return jqEltId(slideInfo.lineIdPrefix + index) }
  function legendSelectId(index)      { return jqEltId(legendIdPrefix + index) }
  function parseLegendId(elt)         { return parseId(elt, 8) }

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

  var dataFiles   = ['Nasa Global Temp Change', '1975 Broecker', '1981 Hansen', '1988 Hansen', '1990 Ipcc1',  '1995 Ipcc2', '2001 Ipcc3', '2007 Ipcc4',  '2013 Ipcc5']
  var colors      = [tempColor,                 'Indigo',        'SaddleBrown', 'Sienna',      'DarkBlue',    'MediumBlue', 'Blue',       'DeepSkyBlue', 'LightSkyBlue']
  var sliceCounts = [90,                        0,               0,             0,             0,             0,            0,            0,             0]
  
  await populateDataObjs(slideInfo, dataFiles, colors, sliceCounts)

  var valueMins  = slideInfo.dataObjs.map( dataObj => d3.min(dataObj.values, function(d) { return +d.value; }))
  var valueMaxes = slideInfo.dataObjs.map( dataObj => d3.max(dataObj.values, function(d) { return +d.value; }))

  //x-axis
  var x = d3.scaleLinear().domain([slideInfo.minYear, slideInfo.maxYear]).range([ 0, canvasWidth ])
  slideInfo.svg.append('g').attr('transform', 'translate(0,' + canvasHeight + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));

  //y-axis
  var dataMinMax = [Math.min(...valueMins) - 0.1, Math.max(...valueMaxes)]
  var y = d3.scaleLinear().domain(dataMinMax).range([ canvasHeight, 0 ]);
  slideInfo.svg.append('g').call(d3.axisLeft(y))
  slideInfo.svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - canvasMargin.left)
    .attr("x",0 - (canvasHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style('font-size', '70%')
    .text('Global temperature change \u00B0C')

  for (var i=0; i<slideInfo.lineCount; ++i) {
	slideInfo.dataObjs[i].x = x
    slideInfo.dataObjs[i].y = y

    //legend
    slideInfo.svg.append('text')
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
  for (var i=0; i<slideInfo.lineCount; ++i) {
    animateLine(i)
    await sleep(animationTime(i))
  }
  */

  addDataLines(slideInfo)
  addMouseOverEffects(slideInfo)
  
  for (var i=1; i<slideInfo.lineCount; ++i) {unselectLine(i)}
}
