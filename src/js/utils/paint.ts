import { ETextPosition } from '../../const/index';

export const paint = {
  drawText: (ctx: any, node: any) => {
    const {
      text,
      font,
      fontColor
    } = node;

    if (!text) return;

    const {
      x,
      y,
      textBaseline
    } = __getTextPosition(ctx, node);

    ctx.font = font;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = fontColor;
    ctx.fillText(text, x, y);
  },

  // 绘制矩形块，对应 css block 块
  drawRect,

  drawImage: (ctx: CanvasRenderingContext2D, node: any) => {
    const {
      x,
      y,
      width,
      height
    } = node;

    return new Promise((resolve, reject) => {
      const bgImg = new Image();
      bgImg.src = node.image;
      bgImg.onload = () => {
        console.log(1111);
        ctx.drawImage(bgImg, x, y, width, height);
        resolve();
      };

      bgImg.onerror = reject;
    });
  },

  
  drawBorder: (ctx: CanvasRenderingContext2D, node: any) => {
    if (!node.showSelected) return drawBorder(ctx, node, 'transparent')

    if (node.__isActive) {
      drawBorder(ctx, node)
    } else {
      drawBorder(ctx, node, '#fff')
    }
  }

 };

 let __lastBorderColor: any;
 function drawBorder(ctx: CanvasRenderingContext2D, node: any, borderColor = '#ddd', borderWidth: number = 4) {
  if (__lastBorderColor === borderColor) return;
  __lastBorderColor = borderColor;
  
  let {
    x,
    y,
    width,
    height
  } = node;

  ctx.save();

  x -= borderWidth / 2;
  y -= borderWidth / 2 ;
  width += borderWidth;
  height += borderWidth;
  ctx.lineWidth = borderWidth;
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y);

  ctx.strokeStyle = borderColor;
  ctx.stroke();
  ctx.restore();
 }

 function drawRect(ctx: CanvasRenderingContext2D, node: any) {
  const {
    x,
    y,
    width,
    height,
    borderRadius = 0,
    borderStyle,
    borderWidth = 0.5,
    borderColor = '#000000',
    backgroundColor = '#ffffff'
  } = node;
  let r = borderRadius;
  const w = width;
  const h = height;
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;

  ctx.save();
  if (borderStyle === 'dashed') {
    ctx.setLineDash([5, 5]);
  }
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;

  // 圆角矩形
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();

  // 填充背景色
  ctx.fillStyle = backgroundColor;
  ctx.fill();

  ctx.restore();
}


function __getTextPosition(ctx: any, node: any) {
  const {
    x,
    y,
    width,
    height,
    font,
    text,
    textOffsetY,
    textPosition
  } = node;

  let yOffset = y;
  let textBaseline = '';
  switch (textPosition) {
    case ETextPosition.BottomCenter:
      yOffset = y + height + 2;
      textBaseline = 'top';
      break;
    case ETextPosition.TopCenter:
      yOffset = y;
      textBaseline = 'bottom';
      break;
    default:
      yOffset = y + height / 2;
      textBaseline = 'middle';
      break;
  }

  ctx.font = font;
  const mtext = ctx.measureText(text); // TextMetrics object

  return {
    x: x + (width - mtext.width) / 2,
    y: yOffset + textOffsetY + 4,
    textBaseline
  };
}

