async function buildTemperatureSlide() {
  var margin = {top: 10, right: 30, bottom: 30, left: 60}
  var width = 800 - margin.left - margin.right
  var height = 600 - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg = d3.select('#cs498_narrative')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var dataFiles  = ['Nasa-GlobalTemp.csv', '1975_Broecker.csv', '1981_Hansen.csv', '1988_Hansen.csv', '1990_Ipcc1.csv', '1995_Ipcc2.csv']
  var colors     = ['red',                 'steelblue',         'blue',            'yellow',          'chocolate',      'brown']
  var allData    = []
  
  for (var i=0; i<dataFiles.length; ++i) {
	  allData[i] = await d3.csv('/data/' + dataFiles[i])
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
  svg.append('g').call(d3.axisLeft(y));

  for (var i=0; i<dataFiles.length; ++i) {
    svg.append('path')
      .datum(allData[i])
      .attr('fill', 'none')
      .attr('stroke', colors[i])
      .attr('stroke-width', 1.5)
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return y(d.deltaC) }))	
  }
}

async function loadData(fileName) {
  return await d3.csv('/data/' + fileName)
}

buildTemperatureSlide()