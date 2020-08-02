
const slideCount        = 3
const totalCanvasWidth  = 1000
const totalCanvasHeight = 700

const canvasMargin = {top: 10, right: 30, bottom: 30, left: 60}
const canvasWidth  = totalCanvasWidth - canvasMargin.left - canvasMargin.right
const canvasHeight = totalCanvasHeight  - canvasMargin.top - canvasMargin.bottom

const tempColor          = 'DarkRed'
const lineClass          = 'line'
	
function sleep(ms)      { return new Promise(resolve => setTimeout(resolve, ms)) }
function jqEltId(eltId) { return '#' + eltId }
function classId(name)  { return '.' + name }
function lineId(slideInfo, lineIndex)          { return slideInfo.lineIdPrefix + lineIndex }
function lineDataPointId(slideInfo, lineIndex) { return slideInfo.linePointIdPrefix + lineIndex }

function parseId(elt, indexIndex)      { return parseInt(elt.attr('id').substr(indexIndex)) }
function parseLineId(elt)              { return parseId(elt, 6) }
function parseLineIdFromDataPoint(elt) { return parseInt(elt.attr('id').substr(11,12))}

function setDataPointVisibility(slideInfo, visible) {
  d3.select(jqEltId(slideInfo.trackingLineId)).style('opacity', visible ? '1' : '0')
  for (var i=0; i<slideInfo.dataObjs.length; ++i) {
    d3.select(jqEltId(lineDataPointId(slideInfo, i))).select('circle').style('opacity', visible ? '1' : '0')
    d3.select(jqEltId(lineDataPointId(slideInfo, i))).select('text').style('opacity', visible ? '1' : '0')
  }
}

var slideInfos = []
for (var i = 0; i<slideCount; ++i) {
  var slideId = 's' + (i + 1)
  var slideInfo = {
    id:                      slideId,
    lineIdPrefix:            slideId + 'line',
    linePointIdPrefix:       slideId + 'linePoint',
    trackingLineId:          slideId + 'tracking-line'
  }
  var slideDiv = d3.select(jqEltId(slideInfo.id))
  slideDiv.style('display','none')
  slideInfo.svg = slideDiv
    .append('svg').attr('width', canvasWidth + canvasMargin.left + canvasMargin.right).attr('height', canvasHeight + canvasMargin.top + canvasMargin.bottom)
    .append('g').attr('transform', 'translate(' + canvasMargin.left + ',' + canvasMargin.top + ')')
  slideInfos[i] = slideInfo
}

async function populateDataObjs(slideInfo, dataFiles, lineColors, sliceCounts) {
  slideInfo.lineCount = dataFiles.length
  var minYear     = 0
  var maxYear     = 0
  slideInfo.dataObjs = []
  for (var i=0; i<slideInfo.lineCount; ++i) {
    slideInfo.dataObjs[i] = {}
    slideInfo.dataObjs[i].values = await d3.csv('/data/' + dataFiles[i] + '.csv')
    slideInfo.dataObjs[i].values = slideInfo.dataObjs[i].values.slice(sliceCounts[i])
    slideInfo.dataObjs[i].color  = lineColors[i]
    slideInfo.dataObjs[i].y      = null
    var dataMinYear = d3.min(slideInfo.dataObjs[i].values, function(d) { return d.year; })
    var dataMaxYear = d3.max(slideInfo.dataObjs[i].values, function(d) { return d.year; })
    if (minYear == 0 || minYear > dataMinYear ) minYear = dataMinYear
    if (maxYear == 0 || maxYear < dataMaxYear ) maxYear = dataMaxYear
  }
  slideInfo.minYear = minYear
  slideInfo.maxYear = maxYear
}

function addDataLines(slideInfo) {
  for (var i=0; i<slideInfo.lineCount; ++i) {
    slideInfo.svg.append('path')
      .datum(slideInfo.dataObjs[i].values)
      .attr('class', 'line')
      .attr('id', lineId(slideInfo,i))
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2)
      .attr('stroke', slideInfo.dataObjs[i].color)
      .attr('d', d3.line().x(function(d) { return  slideInfo.dataObjs[i].x(d.year) }).y(function(d) { return slideInfo.dataObjs[i].y(+d.value) }))
  }
}

function addMouseOverEffects(slideInfo) {
  var mouseG = slideInfo.svg.append('g')
  for (var i=0; i<slideInfo.dataObjs.length; ++i) {
    var lineDataPoint = mouseG.append('g').attr('id', lineDataPointId(slideInfo, i))
    lineDataPoint.append('circle')
      .attr('r', 5)
      .style('stroke', slideInfo.dataObjs[i].color)
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('opacity', '0')
    lineDataPoint.append('text').attr('stroke', slideInfo.dataObjs[i].color).attr('transform', 'translate(-15,-10)');
  }
	
  //mouse-tracking vertical line
  mouseG.append('path').attr('id', slideInfo.trackingLineId).style('stroke', 'Lavender').style('stroke-width', '1px').style('opacity', '0');
  var lines = document.getElementsByClassName(lineClass);
  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', canvasWidth) // can't catch mouse events on a g element
    .attr('height', canvasHeight)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseover', function() { setDataPointVisibility(slideInfo, true) })
    .on('mouseout',  function() { setDataPointVisibility(slideInfo, false) })
    .on('mousemove', function() {
      var mouse = d3.mouse(this);
      d3.select(jqEltId(slideInfo.trackingLineId)).attr('d', function() {
        var d = "M" + mouse[0] + "," + canvasHeight;
        d += " " + mouse[0] + "," + 0;
        return d;
      });
    
      for (var i =0; i<slideInfo.dataObjs.length; ++i ) {
        var pointEltId = jqEltId(lineDataPointId(slideInfo, i)) 
        d3.select(pointEltId)
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

            d3.select(pointEltId).select('text').text(slideInfo.dataObjs[i].y.invert(pos.y).toFixed(2));

            return 'translate(' + mouse[0] + ',' + pos.y + ')';
          });
      }
    });
}

buildSlide1(slideInfos[0]); //d3.select(jqEltId(slideInfos[0].id)).style('display','block')
buildSlide2(slideInfos[1]); d3.select(jqEltId(slideInfos[1].id)).style('display','block')
buildSlide3(slideInfos[2]);

//for (var i = 0; i<slideCount; ++i) { window['buildSlide' + i](slideInfo); }
