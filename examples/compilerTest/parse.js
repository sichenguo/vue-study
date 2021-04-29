let template = "";

parseHTML(template, {
  start(tag, attrs, unary) {
    // 每当解析到标签开始位置时，触发该函数
    createASTElement(tag, attrs, currentParent);
  },
  end(tag, attrs, unary) {
    // 每当解析到标签结束位置时，触发该函数
  },
  chars(text) {
    // 每当解析到文本时，触发该函数
  },
  comment(text) {
    // 每当解析到注释时，触发该函数
  }
});

function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    parent,
    children: []
  };
}

// 工具函数
function advance(n) {
  index += n;
  html = html.substring(n);
}

// ### parse 整体流程伪代码
// 用到的正则表达式

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = "[a-zA-Z_][\\w\\-\\.]*";
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

export function parse(
  template: string,
  options: CompilerOptions
): ASTElement | void {
  getFnsAndConfigFromOptions(options);

  parseHTML(template, {
    // options ...
    start(tag, attrs, unary) {
      let element = createASTElement(tag, attrs);
      processElement(element);
      treeManagement();
    },

    end() {
      treeManagement();
      closeElement();
    },

    chars(text: string) {
      handleText();
      createChildrenASTOfText();
    },
    comment(text: string) {
      createChildrenASTOfComment();
    }
  });
  return astRootElement;
}

// closeElement 逻辑很简单，就是更新一下 inVPre 和 inPre 的状态，以及执行 postTransforms 函数，这些暂时都不必了解
function closeElement(element) {
  // check pre state
  if (element.pre) {
    inVPre = false;
  }
  if (platformIsPreTag(element.tag)) {
    inPre = false;
  }
  // apply post-transforms
  for (let i = 0; i < postTransforms.length; i++) {
    postTransforms[i](element, options);
  }
}

function advance (n) {
  index += n
  html = html.substring(n)
}

// ----------------------------------------------------------------------------------
// #### 文本解析器部分
export function parse(
  template: string,
  options: CompilerOptions
): ASTElement | void {
  getFnsAndConfigFromOptions(options);

  parseHTML(template, {
    // options ...
    start(tag, attrs, unary) {
      let element = createASTElement(tag, attrs);
      processElement(element);
      treeManagement();
    },

    end() {
      treeManagement();
      closeElement();
    },

    chars(text: string) {
      // handleText()
      // createChildrenASTOfText()
      // 实现伪代码
      text = text.trim();
      if (text) {
        const children = currentParent.children;
        let expression;
        if ((expression = parseText(text))) {
          children.push({
            type: 2, // 带变量的动态文本
            expression,
            text
          });
        } else {
          children.push({
            type: 3, // 纯文本
            expression,
            text
          });
        }
      }
    },
    comment(text: string) {
      createChildrenASTOfComment();
    }
  });
  return astRootElement;
}

// 补充函数
// var re = /(hi1)?/g;
// console.log(re.exec("hi"));
// console.log(re.lastIndex);

// exec文档 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
// result [0]-匹配的全部字符串，[1], ...[n ]-括号中的分组捕获
// 当正则表达式使用 "g" 标志时，可以多次执行 exec 方法来查找同一个字符串中的成功匹配。当你这样做时，查找将从正则表达式的 lastIndex 属性指定的位置开始
function parseText(text) {
  const tagRE = /\{\{((?:.|\n)+?)\}\}/g;
  if (!tagRE.test(text)) {
    return;
  }
  const tokens = [];
  let lastIndex = (tagRE.lastIndex = 0); // 下一次匹配开始的字符串起点标记
  let match, index;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // 先把{{ 前面的文本添加到 tokens中
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    // 把变量变成_s(x)的形式添加进数组
    tokens.push(`_s(${match[1].trim()})`);
    // 设置 lastindex 来保证下一轮循环时，正则表达式不再重复匹配已经解析过的文本
    lastIndex = index + match[0].length;
  }
  // 当所有的标量都处理完毕后，如果最后一个变量右边还有文本，就将文本添加进数组中
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return tokens.joins("+");
}

