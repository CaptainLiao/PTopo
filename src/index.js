import Layout from './Layout'

const renderInH5 = ({ canvasId, xml, style}) => {
  const dpr = window.devicePixelRatio
  const w = document.documentElement.clientWidth
  const h = document.documentElement.clientHeight
  const canvasEle = document.querySelector(canvasId)
  const ctx = canvasEle.getContext('2d')
  canvasEle.width = w*dpr
  canvasEle.height = h*dpr
  canvasEle.style.width = `${w}px`
  canvasEle.style.height = `${h}px`

  ctx.scale(dpr, dpr)

  const layout = new Layout({
    style: {
      width: 0,
      height: 0,
    },
    name: 'layout'
  });
  
  style = _scaleStyles({style, clientWidth: w})
  layout.init(xml, style).render(ctx)

  console.log(layout);
  drawGrid(ctx, w, h)
};

const renderInMP = ({ canvasId, xml, style}) => {
  const {
    screenWidth,
    pixelRatio,
  } = wx.getSystemInfoSync();
  const dpr = pixelRatio

  const canvasRef = wx.createSelectorQuery().select(canvasId)

  canvasRef.node(res => {
    const canvasEle = res.node;
    const ctx = canvasEle.getContext('2d')
    canvasEle.width = canvasEle._width*dpr
    canvasEle.height = canvasEle._height*dpr
    
    ctx.scale(dpr, dpr)
    
    const layout = new Layout({
      style: {
        width: 0,
        height: 0,
      },
      name: 'layout'
    });

    style = _scaleStyles({style, clientWidth: screenWidth})
    layout.init(xml, style).render(ctx)
  
    console.log(layout);
    drawGrid(ctx, canvasEle.width, canvasEle.height)

  })
  .exec()
};


export default __buildTarget__ === 'web'
  ? renderInH5
  : renderInMP;


const LAYOUT_BASE_WIDTH = 375
function _scaleStyles({clientWidth, style}) {
  const x = clientWidth/LAYOUT_BASE_WIDTH

  return Object.keys(style).reduce((res, key) => {
    const s = style[key]
    res[key] = Object.keys(s).reduce((acc, k) => {
      const [n, t] = String(s[k]).replace(/(\d+)(\D+)/g, '$1-$2').split('-')
      if (isNaN(parseFloat(n))) {
        acc[k] = s[k]
        return acc
      }
      acc[k] = n*x
      if (t) acc[k] += t
      return acc
    }, {})

    return res
  }, {})
}

function drawGrid(ctx, w, h) {
  ctx.save()
  const gap = 10
  for (let i = 1; i < w/gap; ++i) {
    ctx.moveTo(i * gap, 0)
    ctx.lineTo(i*gap, h)
  }
  for (let i = 1; i < w/gap; ++i) {
    ctx.moveTo(0, i*gap)
    ctx.lineTo(w, i*gap)
  }
  for (let i = 0; i < w; i += 2) {
    ctx.fillText(i*gap*2, i*gap*2 - 6, 10)
  }

  ctx.strokeStyle = 'rgba(0, 0, 0,.15)'
  ctx.stroke()
  ctx.restore()
}