async function buildSlide2() {
  var margin = {top: 10, right: 30, bottom: 30, left: 60}
  var width  = 800 - margin.left - margin.right
  var height = 600 - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg = d3.select('#slide2')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var dataFiles  = ['Nasa_Global Temp', '1975_Broecker', '1981_Hansen', '1988_Hansen', '1990_Ipcc1', '1995_Ipcc2', '2001_Ipcc3', '2007_Ipcc4', '2013_Ipcc5']
  var colors     = ['black',            'darkred',       'chocolate',   'brown',       'cornflowerblue', 'cadetblue', 'royalblue', 'darkslateblue', 'steelblue']
  var allData    = []
  
  for (var i=0; i<dataFiles.length; ++i) {
	  allData[i] = await d3.csv('/data/' + dataFiles[i] + '.csv')
  }

  allData[0]     = allData[0].slice(90)
  var yearMins   = allData.map( data => d3.min(data, function(d) { return d.year; }))
  var yearMaxes  = allData.map( data => d3.max(data, function(d) { return d.year; }))
  var deltaMins  = allData.map( data => d3.min(data, function(d) { return d.deltaC; }))
  var deltaMaxes = allData.map( data => d3.max(data, function(d) { return d.deltaC; }))

  //x-axis
  var yearsMinMax = [Math.min(...yearMins), Math.max(...yearMaxes)]
  var x = d3.scaleLinear().domain(yearsMinMax).range([ 0, width ])
  svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));

  //y-axis
  var dataMinMax = [Math.min(...deltaMins) - 0.2, Math.max(...deltaMaxes)]
  var y = d3.scaleLinear().domain(dataMinMax).range([ height, 0 ]);
  svg.append('g').call(d3.axisLeft(y))
  svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle").text('Global temperature change \u00B0C')

  //tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");  

  var tooltipPoint = svg.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('id', 'tooltipPoint').style('opacity', 0)
  
  for (var i=0; i<dataFiles.length; ++i) {
    var lineName = (i == 0 ? 'Actual' : dataFiles[i].substr(5) )
    //line
    svg.append('path')
      .datum(allData[i])
      .attr('class', 'line')
      .attr('id', 'line' + i)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', unselectedLineWidth(i))
      .attr('stroke', unselectedLineColor(i))
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return y(d.deltaC) }))
      .on('mouseover', function(d) { selectLine(  parseLegendId(d3.select(this))) })
      .on('mouseout',  function(d) { unselectLine(parseLegendId(d3.select(this))) })

    //mouseover regions
    svg.selectAll('circles')
      .data(allData[i])
      .enter()
      .append('circle')
      .attr('cx', function(d) { return x(d.year) })      
      .attr('cy', function(d) { return y(d.deltaC) })
      .attr('r', 8)
      .attr('id', function(d) { return i + '_' + d.i + '_mouseover' })
      .style('opacity', 0)
      .on('mouseover', function(d) {
        var thisCircle = d3.select(this)
        var lineIndex = parseInt(thisCircle.attr('id').substr(0,1))
        
        tooltip.transition().delay(30).duration(200).style('opacity', 1);
        tooltip.html(d.deltaC).style('left', (d3.event.pageX) + 'px').style("top", (d3.event.pageY - 20) + 'px').style('color', colors[lineIndex])
        tooltipPoint.attr('cx', thisCircle.attr('cx')).attr('cy', thisCircle.attr('cy'))
        tooltipPoint.transition().delay('20').duration('200').style('opacity', 1).style('fill', colors[lineIndex])    
        selectLine(lineIndex)
      })
      .on('mouseout', function(d) {
        var thisCircle = d3.select(this)
        var lineIndex = parseInt(thisCircle.attr('id').substr(0,1))
        tooltip.transition().duration(100).style('opacity', 0)
        tooltipPoint.transition().delay('20').duration('200').style('opacity', 0)
        unselectLine(lineIndex)
      })
    
    //legend
    svg.append('text')
      .attr('class', 'legend')
      .attr('id', 'legend' + i)
      .attr('x', 20)
      .attr('y', 15 + i*20)
      .attr('stroke', i == 0 ? colors[i] : 'lightgrey')
      .text((i == 0 ? 'Actual' : 'Prediction: ' + dataFiles[i].substr(5)) + ', ' + dataFiles[i].substr(0,4))
      .on('mouseover', function(d) { selectLine(  parseLegendId(d3.select(this))) })
      .on('mouseout',  function(d) { unselectLine(parseLegendId(d3.select(this))) })
  }
  
  d3.selectAll('.line').style('opacity', '0')
  for (var i=0; i<dataFiles.length; ++i) {
    animateLine(i)
    await sleep(animationTime(i) + 1000)
  }
  
  function parseId(elt, indexIndex)   { return parseInt(elt.attr('id').substr(indexIndex)) }
  function parseLineId(elt)           { return parseId(elt, 4) }
  function parseLegendId(elt)         { return parseId(elt, 6) }
  function unselectedLineColor(index) { return index == 0 ? colors[index] : 'lightgrey' }
  function unselectedLineWidth(index) { return index == 0 ? 2 : 1 }
  function animationTime(index)       { return index == 0 ? 5000 : 2000 }

  function selectLine(index) {
    var color = colors[index]
    d3.select('#line' + index).style('stroke-width', 3).attr('stroke', color)
    d3.select('#legend' + index).style('font-size', '110%').attr('stroke', color)
  }

  function unselectLine(index) {
    var color = unselectedLineColor(index)
    d3.select('#line' + index).style('stroke-width', unselectedLineWidth(index)).attr('stroke', color)
    d3.select('#legend' + index).style('font-size', '100%').attr('stroke', color)  
  }

  function animateLine(index) {
    var lineId      = '#line' + index
    var legendId    = '#legend' + index
    var preColor    = colors[index]
    var postColor   = unselectedLineColor(index, colors)
    var animateTime = animationTime(index)
    var totalLength = d3.select(lineId).node().getTotalLength();
    d3.select(lineId).style('opacity','1')
    d3.selectAll(lineId)
    d3.select(legendId)
      .attr('stroke', preColor)
      .transition().duration(animateTime)
      .attr('stroke', postColor)
    d3.select(lineId)
      .style('opacity','1')
      .style('stroke-width', 4)
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .attr('stroke', preColor)
      .transition().duration(animateTime)
      .attr('stroke-dashoffset', 0)
      .attr('stroke', postColor)
      .style('stroke-width', index == 0 ? 2 : 1)
  }

}
