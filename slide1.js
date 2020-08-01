async function buildSlide1() {
  const slideId = 's1'

  var margin = {top: 10, right: 30, bottom: 30, left: 60}
  var width  = 800 - margin.left - margin.right
  var height = 600 - margin.top - margin.bottom
  
  // append the svg object to the body of the page
  var svg = d3.select('#' + slideId)
    .append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
    .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var dataFiles  = ['Nasa Co2 Ppm', 'Nasa Global Temp Change', 'Epa Global Mean Sea Level', 'Wgms Loss of Glacier Mass']
  var unit       = ['Parts per Mil','Change\u00B0C',           'Change inches',             'black']
  var colors     = ['black',        'black',                   'black',                     'black']
  var sliceCount = [0,              78,                        78,                          8]
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
  var x = d3.scaleLinear().domain(yearsMinMax).range([ 0, width ])
  svg.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));

  for (var i=0; i<dataFiles.length; ++i) {
    svg.append('g').attr('transform', 'translate(0,' + ((height/4)*(i+1)) + ')').call(d3.axisBottom(x).tickFormat(d3.format('d')));

    //y-axis
    var dataMinMax = [d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })]
    y[i] = d3.scaleLinear().domain(dataMinMax).range([ ((height/4)*(i+1)), 0 ]);
    svg.append('g').call(d3.axisLeft(y[i]))
    svg.append('text')
      .attr("x", 0 - margin.left)
      .attr("y",0 - ((height/8)*(i+1)))
      .attr("dy", "1em")
      .style("text-anchor", "middle").text(dataFiles[i])
    svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - margin.left)
      .attr("x",0 - ((height/8)*(i+1)))
      .attr("dy", "1em")
      .style("text-anchor", "middle").text(unit[i])

    svg.append('path')
      .datum(allData[i])
      .attr('class', 'line')
      .attr('id', lineIdPrefix + i)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2)
      .attr('stroke', colors[i])
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return y[i](d.value) }))
  }
}
