
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const totalCanvasWidth  = 1000
const totalCanvasHeight = 700

var canvasMargin = {top: 10, right: 30, bottom: 30, left: 60}
const canvasWidth  = totalCanvasWidth - canvasMargin.left - canvasMargin.right
const canvasHeight = totalCanvasHeight  - canvasMargin.top - canvasMargin.bottom

const tempColor = 'DarkRed'

buildSlide1()
//buildSlide2()
//buildSlide3()
