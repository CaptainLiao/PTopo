import {
  Text,
  View,
  Image,
  canvasRenderer,
  Element,
} from './components'

import {getTextWidth} from './utils/measureText'

import parser from './libs/fast-xml-parser/parser'
import computeLayout from 'css-layout'

export const STATE = {
  "UNINIT": "UNINIT",
  "INITED": "INITED",
  "RENDERED": "RENDERED",
  "CLEAR": "CLEAR",
}

const nodeMap = {
  view: View,
  text: Text,
  image: Image,
  scrollview: View
}

const createRenderTree = function (node, style) {
  const attr = node.attr || {};
  const id = attr.id || ''
  const args = Object.keys(attr)
    .reduce((obj, key) => {
      const value = attr[key]
      const attribute = key;

      if (key === 'id') {
        obj.style = {
          ...obj.style,
          ...style[id]
        }
        return obj
      }

      if (key === 'class') {
        obj.style = value.split(/\s+/).reduce((res, oneClass) => {
          return {...res, ...style[oneClass]}
        }, obj.style || {})

        return obj
      }

      if (value === 'true') {
        obj[attribute] = true
      } else if (value === 'false') {
        obj[attribute] = false
      } else {
        obj[attribute] = value
      }

      return obj;
    }, {})


  args.idName = id
  args.className = attr.class || ''
  args._text_ = node._text_

  const NODE = nodeMap[node.name];
  const element = new NODE(args)
  element.root = this;

  (node.children || []).forEach(childNode => {
    const childElement = createRenderTree.call(this, childNode, style);

    element.add(childElement);
  });

  return element;
}

function setLayoutBox(children) {
  children.forEach(child => {
    const parentBox = child.parent.layoutBox
    child.layoutBox = {
      x: ~~parentBox.x + child.layout.left,
      y: ~~parentBox.y + child.layout.top,
      width: child.layout.width,
      height: child.layout.height,
    }

    setLayoutBox.call(this, child.children)
  })
}

export default class Layout extends Element {
  constructor({
    style,
    name
  } = {}) {
    super({
      style,
      id: 0,
      name
    });

    this.renderContext = null

    this.renderport = {}
    this.viewport = {}
    this.__cost_time = {}

    this.hasViewPortSet = false
    this.layoutBox = {
      x: 0,
      y: 0,
    }
  }

  init(template, style) {
    const start = new Date();

    const parseConfig = {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "_text_",
      ignoreAttributes: false,
      ignoreNameSpace: true,
      allowBooleanAttributes: true,
      parseNodeValue: false,
      parseAttributeValue: false,
      trimValues: true,
      parseTrueNumberOnly: false,
    }

    const jsonObj = parser.parse(template, parseConfig, true);
    this.__xmlTree = jsonObj.children[0];
    
    this.__style = style
    this.__cost_time.xmlTree = new Date() - start;

    // XML树生成渲染树
    const renderTree = createRenderTree.call(this, this.__xmlTree, this.__style);
    this.__cost_time.renderTree = new Date() - start;
    // 计算布局树
    computeLayout(renderTree);
    this.__cost_time.layoutTree = new Date() - start;
    // 要处理文字换行，需要两棵renderTree
    const renderTree2 = createRenderTree.call(this, this.__xmlTree, this.__style)
    reCalculate([renderTree2], [renderTree])
    computeLayout(renderTree2);

    this.add(renderTree2);

    const rootEle = this.children[0];

    if (rootEle.style.width === undefined || rootEle.style.height === undefined) {
      console.error('Please set width and height property for root element');
    } else {
      this.renderport.width = rootEle.style.width;
      this.renderport.height = rootEle.style.height;
    }

    setLayoutBox.call(this, this.children)
    
    return this
  }

  render(ctx) {
    canvasRenderer(ctx);
    
    this.renderContext = ctx;

    if (this.renderContext) {
      this.renderContext.clearRect(0, 0, this.renderport.width, this.renderport.height);
    }
    // TODO: 待优化
    const renderChildren = children => {
      return children.reduce((promise, child) => {
        return promise.then(() => {
          renderChildren(child.children); 
          return child.render(ctx)
        })
      }, Promise.resolve())
    }
    renderChildren(this.children)
  }
}

// helper
function reCalculate(list, layoutList) {
  list.forEach((child, index) => {
    // 处理文字换行
    if (child.type === "Text") {
      const currentLayoutNode = layoutList[index]
      const parent = currentLayoutNode.parent
      child.style.width = Math.min(
        parent.layout.width - 2 * currentLayoutNode.layout.left,
        currentLayoutNode.layout.width
      )

      const contentWidth = child.style.width
        - child.style.borderLeftWidth
        - child.style.borderRightWidth
        // - child.style.paddingLeft
        // - child.style.paddingRight

      let lineIndex = 1
      let lineText = ''
      for (let i = 0; i < child.text.length; i++) {
        const textWidth = getTextWidth({text: lineText + child.text[i], style: child.style})
        if (textWidth > contentWidth) {
          child.__lines.push({text: lineText})
          lineText = ''
          lineIndex += 1
        }
        lineText += child.text[i]
      }
      child.__lines.push({text: lineText})

      child.style.height = parseFloat(child.style.lineHeight) * lineIndex
        + child.style.paddingBottom
        + child.style.paddingTop
        + child.style.borderTopWidth
        + child.style.borderBottomWidth
    }
    reCalculate(child.children, layoutList[index].children)
  })
}





