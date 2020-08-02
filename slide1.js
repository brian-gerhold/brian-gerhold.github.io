async function buildSlide1(slideInfo) {
  const chartMarginTop = 50
  const flowImageSize  = 20
  
  // append the svg object to the body of the page
  var svg = d3.select(jqEltId(slideInfo.id))
    .append('svg').attr('width', canvasWidth + canvasMargin.left + canvasMargin.right).attr('height', canvasHeight + canvasMargin.top + canvasMargin.bottom)
    .append('g').attr('transform', 'translate(' + canvasMargin.left + ',' + canvasMargin.top + ')')

  
  var dataFiles  = ['Nasa Co2 Ppm',      'Nasa Global Temp Change', 'Wgms Glacier Loss',     'Epa Global Mean Sea Level']
  var units      = ['Parts per Million', 'Change\u00B0C',           'Thickness Loss Meters', 'Change inches']
  var colors     = ['Black',             tempColor,                 'DarkGray',               'DarkBlue']
  var sliceCount = [0,                   78,                        8,                       78]
  var chartCount = dataFiles.length
  var dataObjs   = []
  var minYear    = 0
  var maxYear    = 0
  slideInfo.lineCount = dataFiles.length
  for (var i=0; i<dataFiles.length; ++i) {
	dataObjs[i] = {}
    dataObjs[i].values = await d3.csv('/data/' + dataFiles[i] + '.csv')
    dataObjs[i].values = dataObjs[i].values.slice(sliceCount[i])
    dataObjs[i].unit   = units[i]
    dataObjs[i].color  = colors[i]
    dataObjs[i].y      = null
    var dataMinYear = d3.min(dataObjs[i].values, function(d) { return d.year; })
    var dataMaxYear = d3.max(dataObjs[i].values, function(d) { return d.year; })
    if (minYear == 0 || minYear > dataMinYear ) minYear = dataMinYear
    if (maxYear == 0 || maxYear < dataMaxYear ) maxYear = dataMaxYear
  }

  //x-axes
  var x = d3.scaleLinear().domain([minYear, maxYear]).range([ 0, canvasWidth ])

  var chartHeight = (canvasHeight  - (chartMarginTop * (chartCount - 1)) )/chartCount
  for (var i=0; i<chartCount; ++i) {
    
    var yTop       = chartHeight*(i+1) + (chartMarginTop * i)
    var yBottom    = chartHeight*(i) + (chartMarginTop * i)
    var data       = dataObjs[i].values
    var nameTokens = dataFiles[i].split(' ')
    var sourceName = nameTokens[0]
    var chartTitle = nameTokens.slice(1).join(' ') + ', ' + sourceName
    var chartColor = dataObjs[i].color

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
    dataObjs[i].y = d3.scaleLinear().domain(dataMinMax).range([ yTop, yBottom ]);
    svg.append('g').call(d3.axisLeft(dataObjs[i].y).ticks(5))      
    //y-axis label
    svg.append('text').attr('transform', 'rotate(-90)').attr("y", 0 - canvasMargin.left + 10)
      .attr('x', 0 - yBottom - (chartHeight/2))
      .attr('dy', '0.1em')
      .style('font-size', '70%')
      .style('text-anchor', 'middle').text(dataObjs[i].unit)

    //line
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('id', slideInfo.lineIdPrefix + i)
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2)
      .attr('stroke', chartColor)
      .attr('d', d3.line().x(function(d) { return x(d.year) }).y(function(d) { return dataObjs[i].y(+d.value) }))
      
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

  var mouseG = svg.append('g').attr('class', 'mouse-over-effects');
  for (var i=0; i<chartCount; ++i) {
    var lineDataPoint = mouseG.append('g')
        .attr('class', lineDataPointClass)
        .attr('id', lineDataPointId(slideInfo, i))

    lineDataPoint.append('circle')
      .attr('r', 5)
      .style('stroke', dataObjs[i].color)
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    lineDataPoint.append('text').attr('transform', 'translate(-15,-10)');
  }
  
  //mouse-tracking vertical line
  mouseG.append('path').attr('class', trackingLineClass).style('stroke', 'black').style('stroke-width', '1px').style('opacity', '0');
  var lines = document.getElementsByClassName('line');
  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', canvasWidth) // can't catch mouse events on a g element
    .attr('height', canvasHeight)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseover', function() { setDataPointVisibility(slideInfo, true) })
    .on('mouseout',  function() { setDataPointVisibility(slideInfo, false) })
    .on('mousemove', function() {
      var mouse = d3.mouse(this);
      d3.select(classId(trackingLineClass)).attr('d', function() {
        var d = "M" + mouse[0] + "," + canvasHeight;
        d += " " + mouse[0] + "," + 0;
        return d;
      });
      
      for (var i =0; i<chartCount; ++i ) {
        d3.select(jqEltId(lineDataPointId(slideInfo, i)))
          .attr('transform', function() {
            var beginning = 0
            var end       = lines[i].getTotalLength()
            var target    = null
            var pos
            
            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            d3.select(this).select('text').text(dataObjs[i].y.invert(pos.y).toFixed(2));

            return 'translate(' + mouse[0] + ',' + pos.y + ')';
          });
      }
    });
}
