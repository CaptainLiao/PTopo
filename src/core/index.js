
import Block from './Block';
import Line from './Line';
import Node from './Node';
import Text from './Text';

export {
  Block,
  Line,
  Node,
  Text,
  CanvasStage
}


class CanvasStage {
  constructor({el, width, height, ratio = 1}) {
    this.canvas = el;
    // 解决字体/图片模糊
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(ratio, ratio);
  }

  add(Node) {
    Node.prototype.ctx = this.ctx;
    Node.prototype.canvas = this.canvas;
  }
}







