
const slideCount        = 3
const totalCanvasWidth  = 1000
const totalCanvasHeight = 700

const canvasMargin = {top: 10, right: 30, bottom: 30, left: 60}
const canvasWidth  = totalCanvasWidth - canvasMargin.left - canvasMargin.right
const canvasHeight = totalCanvasHeight  - canvasMargin.top - canvasMargin.bottom

const tempColor          = 'DarkRed'
const trackingLineClass  = 'tracking-line'
const lineDataPointClass = 'line-data-point'
	
function sleep(ms)      { return new Promise(resolve => setTimeout(resolve, ms)) }
function jqEltId(eltId) { return '#' + eltId }
function classId(name)  { return '.' + name }
function lineDataPointId(slideInfo, lineIndex) { return slideInfo.linePointIdPrefix + lineIndex }

function parseId(elt, indexIndex)      { return parseInt(elt.attr('id').substr(indexIndex)) }
function parseLineId(elt)              { return parseId(elt, 6) }
function parseLegendId(elt)            { return parseId(elt, 8) }
function parseLineIdFromDataPoint(elt) { return parseInt(elt.attr('id').substr(11,12))}
function parseMouseOverId(elt)         { return parseInt(elt.attr('id').substr(0,1))}

function setDataPointVisibility(slideInfo, visible) {
  d3.select(classId(trackingLineClass)).style('opacity', visible ? '1' : '0')
  for (var i=0; i<slideInfo.lineCount; ++i) {
    //d3.select(jqEltId(lineDataPointId(slideInfo, i))).select('circle').style('opacity', visible ? '1' : '0')
    //d3.select(jqEltId(lineDataPointId(slideInfo, i))).select('text').style('opacity', visible ? '1' : '0')
  }
}

var slideInfos = []
for (var i = 0; i<slideCount; ++i) {
  var slideId = 's' + (i + 1)
  var slideInfo = {
    id:                      slideId,
    lineIdPrefix:            slideId + 'line',
    linePointIdPrefix:       slideId + 'linePoint',
    mouseoverRegionIdSuffix: slideId + 'mouseOver'    
  }
  slideInfos[i] = slideInfo
  //window['buildSlide' + i](slideInfo);
}

//buildSlide1(slideInfos[0])
buildSlide2(slideInfos[1])
//buildSlide3(slideInfos[2])
