async function buildSlide2(slideInfo) {
  const legendIdPrefix          = slideInfo.id + 'legend'

  function unselectedLineColor(index) { return index == 0 ? colors[index] : 'lightgrey' }
  function unselectedLineWidth(index) { return index == 0 ? 2 : 1 }
  function animationTime(index)       { return index == 0 ? 5000 : 2000 }
  function legendSelectId(index)      { return jqEltId(legendIdPrefix + index) }
  function parseLegendId(elt)         { return parseId(elt, 8) }

  function selectLine(index, updateState) {
    var color = colors[index]
    d3.select(jqEltId(lineId(slideInfo, index))).style('stroke-width', 3).attr('stroke', color)
    d3.select(legendSelectId(index)).style('font-size', '110%').attr('stroke', color)
    if (updateState) slideInfo.dataObjs[index].enabled = true
  }

  function unselectLine(index, updateState) {
    var color = unselectedLineColor(index)
    d3.select(jqEltId(lineId(slideInfo,index))).style('stroke-width', unselectedLineWidth(index)).attr('stroke', color)
    d3.select(legendSelectId(index)).style('font-size', '100%').attr('stroke', color)
    if (updateState) slideInfo.dataObjs[index].enabled = false
  }
  
  function toggleLine(index) {
    if (slideInfo.dataObjs[index].enabled) unselectLine(index)
    else selectLine(index, true)
  }

  function animateLine(index) {
    var lineElt     = d3.select(jqEltId(lineId(slideInfo, index)))
    var legendId    = legendSelectId(index)
    var preColor    = colors[index]
    var postColor   = unselectedLineColor(index, colors)
    var animateTime = animationTime(index)
    var totalLength = lineElt.node().getTotalLength();
    lineElt.style('opacity','1')
    d3.select(legendId).attr('stroke', preColor).transition().duration(animateTime).attr('stroke', postColor)
    lineElt
      .style('opacity','1')
      .style('stroke-width', 4)
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .attr('stroke', preColor)
      .transition().duration(animateTime)
      .attr('stroke-dashoffset', 0)
      .attr('stroke', postColor)
      .style('stroke-width', unselectedLineWidth(index))
    slideInfo.dataObjs[i].enabled = (index == 0)
  }

  var dataFiles   = ['Nasa Global Temp Change', '1975 Broecker', '1981 Hansen', '1988 Hansen', '1990 Ipcc1',  '1995 Ipcc2', '2001 Ipcc3', '2007 Ipcc4',  '2013 Ipcc5']
  var colors      = [tempColor,                 'Indigo',        'DarkOrange',  'Orange',      'DarkBlue',    'MediumBlue', 'Blue',       'DeepSkyBlue', 'LightSkyBlue']
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
  slideInfo.svg.append('text').attr('transform', 'rotate(-90)').attr("y", yLabelX)
    .attr("x",0 - (canvasHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style('font-size', '70%')
    .text('Global temperature change \u00B0C')

  var legendGroup = slideInfo.svg.append('g')
  for (var i=0; i<slideInfo.lineCount; ++i) {
	slideInfo.dataObjs[i].x = x
    slideInfo.dataObjs[i].y = y

    //legend
    legendGroup.append('text')
      .attr('class', 'legend')
      .attr('id', legendIdPrefix + i)
      .attr('x', 20)
      .attr('y', 15 + i*20)
      .attr('stroke', unselectedLineColor(colors[i]))
      .text((i == 0 ? 'Actual' : 'Prediction: ' + dataFiles[i].substr(5)) + ', ' + dataFiles[i].substr(0,4))
      .on('mouseover', function(d) {
        var lineIndex = parseLegendId(d3.select(this))
        if (!slideInfo.dataObjs[lineIndex].enabled) selectLine(lineIndex, false)
      })
      .on('mouseout',  function(d) {
        var lineIndex = parseLegendId(d3.select(this))
        if (!slideInfo.dataObjs[lineIndex].enabled) unselectLine(lineIndex, false)
      })
      .on('click',     function(d) { toggleLine(parseLegendId(d3.select(this))) })
      
    if (i == 0) {
      var eventYear = 2019
      slideInfo.svg.append('rect')
        .attr('width',  2)
        .attr('height', canvasHeight - 40)
        .attr('x',      slideInfo.dataObjs[i].x(eventYear))
        .attr('y',      0 + 40 )
        .attr('fill',   'DarkGray')
      slideInfo.svg.append('text')
        .attr('stroke', tempColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 80)
        .attr('y', canvasHeight - 150)
        .attr('fill', canvasHeight - 150)
        .style('font-size', '80%')
        .text('Most predictions')
      slideInfo.svg.append('text')
        .attr('stroke', tempColor)
        .attr('x', slideInfo.dataObjs[i].x(eventYear) - 80)
        .attr('y', canvasHeight - 135)
        .style('font-size', '80%')
        .text('underestimated')
    }
  }
  
  addSlideTitle(slideInfo, 'Science-based Predictions Tracked Actual Changes', 250)
  addDataLines(slideInfo, false)
  addMouseOverEffects(slideInfo)
  
  d3.selectAll('.line').style('opacity', '0')
  for (var i=0; i<slideInfo.lineCount; ++i) {
    animateLine(i)
    await sleep(animationTime(i))
  }
  
  d3.select(jqEltId(lineId(slideInfo,0))).attr('stroke-width', 5)
  //for (var i=1; i<slideInfo.lineCount; ++i) { d3.select(legendSelectId(index)).raise() }
  legendGroup.raise()
}
