
const slideCount        = 3
var   currentSlide      = 1
const totalCanvasWidth  = 1000
const totalCanvasHeight = 700

const canvasMargin = {top: 50, bottom: 30, right: 50, left: 100}
const canvasWidth  = totalCanvasWidth - canvasMargin.left - canvasMargin.right
const canvasHeight = totalCanvasHeight  - canvasMargin.top - canvasMargin.bottom
const navImageHeight  = 40
const navImageWidth   = 30
const yLabelX         = -50

const tempColor          = 'DarkRed'
	
function sleep(ms)      { return new Promise(resolve => setTimeout(resolve, ms)) }
function jqEltId(eltId) { return '#' + eltId }
function classId(name)  { return '.' + name }
function lineId(slideInfo, lineIndex)          { return slideInfo.lineIdPrefix + lineIndex }
function lineDataPointId(slideInfo, lineIndex) { return slideInfo.linePointIdPrefix + lineIndex }

function parseId(elt, indexIndex)      { return parseInt(elt.attr('id').substr(indexIndex)) }
function parseLineId(elt)              { return parseId(elt, 6) }
function parseLineIdFromDataPoint(elt) { return parseInt(elt.attr('id').substr(11,12))}

function setDataPointsTrackingVisibility(slideInfo, visible) {
  d3.select(jqEltId(slideInfo.trackingLineId)).style('opacity', visible ? '1' : '0')
  for (var i=0; i<slideInfo.lineCount; ++i) { setDataPointVisibility(slideInfo, visible, i) }
}

function setDataPointVisibility(slideInfo, visible, lineIndex) {
  d3.select(jqEltId(lineDataPointId(slideInfo, lineIndex))).select('circle').style('opacity', visible ? '1' : '0')
  d3.select(jqEltId(lineDataPointId(slideInfo, lineIndex))).select('text').style('opacity', visible ? '1' : '0')
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
  if (i != 0)
    slideInfo.svg.append('image')
      .attr('href', 'images/previous-icon.jpeg')
      .attr('x', yLabelX - 40)
      .attr('y', canvasHeight/2)
      .attr('width', navImageWidth)
      .attr('height', navImageHeight)
      .on('mouseover',  function() { d3.select(this).attr('width', navImageWidth + 5).attr('height', navImageHeight + 5) })
      .on('mouseout',   function() { d3.select(this).attr('width', navImageWidth).attr('height', navImageHeight) })
      .on('click',      function() { slideBackward() })
  if (i != slideCount - 1)
    slideInfo.svg.append('image')
      .attr('href', 'images/next-icon.jpeg')
      .attr('x', canvasWidth + 15)
      .attr('y', canvasHeight/2)
      .attr('width', navImageWidth)
      .attr('height', navImageHeight)
      .on('mouseover',  function() { d3.select(this).attr('width', navImageWidth + 5).attr('height', navImageHeight + 5) })
      .on('mouseout',   function() { d3.select(this).attr('width', navImageWidth).attr('height', navImageHeight) })
      .on('click',      function() { slideForward() })
      .raise()

  slideInfos[i] = slideInfo
}

function addSlideTitle(slideInfo, title, xOffset) {
  slideInfo.svg.append('text')
    .attr('stroke', 'Black')
    .attr('x', canvasWidth / 2 - xOffset)
    .attr('y', - 20)
    .style('font-size', '150%')
    .text(title)
}

async function populateDataObjs(slideInfo, dataFiles, lineColors, sliceCounts) {
  slideInfo.lineCount = dataFiles.length
  var minYear     = 0
  var maxYear     = 0
  slideInfo.dataObjs = []
  for (var i=0; i<slideInfo.lineCount; ++i) {
    slideInfo.dataObjs[i] = {}
    slideInfo.dataObjs[i].values  = await d3.csv('/data/' + dataFiles[i] + '.csv')
    slideInfo.dataObjs[i].values  = slideInfo.dataObjs[i].values.slice(sliceCounts[i])
    slideInfo.dataObjs[i].color   = lineColors[i]
    slideInfo.dataObjs[i].y       = null
    slideInfo.dataObjs[i].minYear = d3.min(slideInfo.dataObjs[i].values, function(d) { return +d.year; })
    slideInfo.dataObjs[i].maxYear = d3.max(slideInfo.dataObjs[i].values, function(d) { return +d.year; })
    if (minYear == 0 || minYear > slideInfo.dataObjs[i].minYear ) minYear = slideInfo.dataObjs[i].minYear
    if (maxYear == 0 || maxYear < slideInfo.dataObjs[i].maxYear ) maxYear = slideInfo.dataObjs[i].maxYear
  }
  slideInfo.minYear = minYear
  slideInfo.maxYear = maxYear
}

function addDataLines(slideInfo) {
  for (var i=0; i<slideInfo.lineCount; ++i) {
    slideInfo.svg.append('path')
      .datum(slideInfo.dataObjs[i].values)
      .attr('id', lineId(slideInfo,i))
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2)
      .attr('stroke', slideInfo.dataObjs[i].color)
      .attr('fill', 'none')
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
  mouseG.append('path').attr('id', slideInfo.trackingLineId).attr('stroke', 'Lavender').attr('stroke-width', '1px').attr('opacity', '0')
    //.append('text').attr('stroke', 'Black').attr('y', canvasHeight - 20)

  var lines = []
  for (var i =0; i<slideInfo.lineCount; ++i ) { lines[i] = document.getElementById(lineId(slideInfo, i)); }
  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', canvasWidth) // can't catch mouse events on a g element
    .attr('height', canvasHeight)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseover', function() { setDataPointsTrackingVisibility(slideInfo, true) })
    .on('mouseout',  function() { setDataPointsTrackingVisibility(slideInfo, false) })
    .on('mousemove', function() {
      var mouse = d3.mouse(this);
      d3.select(jqEltId(slideInfo.trackingLineId)).attr('d', function() {
        var d = "M" + mouse[0] + "," + canvasHeight;
        d += " " + mouse[0] + "," + 0;
        return d;
      });
    
      for (var i =0; i<slideInfo.lineCount; ++i ) {
        var pointEltId = jqEltId(lineDataPointId(slideInfo, i))
        d3.select(pointEltId)
          .attr('transform', function() {
            var beginning = 0
            var end       = lines[i].getTotalLength()
            var target    = null
            var pos       = null
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
            
            var year = d3.format('d')(slideInfo.dataObjs[i].x.invert(mouse[0]))
            //d3.select(jqEltId(slideInfo.trackingLineId)).select('text').attr('x', slideInfo.dataObjs[i].x(year)).text(year)
            
            var pointVisibility = (slideInfo.dataObjs[i].minYear <= year && slideInfo.dataObjs[i].maxYear >= year)
        	setDataPointVisibility(slideInfo, pointVisibility, i)
        	if (pointVisibility) d3.select(pointEltId).select('text').text(slideInfo.dataObjs[i].y.invert(pos.y).toFixed(2))
            return 'translate(' + mouse[0] + ',' + pos.y + ')';
          });
      }
    });
}

function slideForward() {
  d3.select(jqEltId(slideInfos[currentSlide -1].id)).style('display','none')
  d3.select(jqEltId(slideInfos[currentSlide].id)).style('display','block')
  slideInfos[currentSlide].svg.raise()
  ++currentSlide
}

function slideBackward() {
  d3.select(jqEltId(slideInfos[currentSlide - 1].id)).style('display','none')
  d3.select(jqEltId(slideInfos[currentSlide - 2].id)).style('display','block')
  slideInfos[currentSlide - 2].svg.raise()
  --currentSlide
}

buildSlide1(slideInfos[0]);  
buildSlide2(slideInfos[1]);
buildSlide3(slideInfos[2]);

d3.select(jqEltId(slideInfos[currentSlide -1].id)).style('display','block'); slideInfos[currentSlide -1].svg.raise()
//d3.select(jqEltId(slideInfos[1].id)).style('display','block')

//for (var i = 0; i<slideCount; ++i) { window['buildSlide' + i](slideInfo); }
