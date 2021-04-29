// #### 1 截取开始标签

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\w\\-\\.]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// 1.1 解析开始标签
// ncname  不包含冒号(:)的 XML 名称
// qname  qname(qualified name) 就是：<前缀:标签名称>  https://zh.wikipedia.org/wiki/%E9%99%90%E5%AE%9A%E5%90%8D
console.log("<div>hello world</div>".match(startTagOpen)); // 测试开始标签
// [
//   '<div',
//   'div',
//   index: 0,
//   input: '<div>hello world</div>',
//   groups: undefined
// ]
console.log("</div><div>hello world</div>".match(startTagOpen)); // 测试开始标签  => null
console.log("hello world</div>".match(startTagOpen)); // 测试开始标签 => null

console.log('<div id="demo">hello world</div>'.match(startTagOpen));

// 1.2.解析标签属性
// 解析单个标签属性

console.log('class="some-class"'.match(attribute)); // 测试双引号
console.log("class='some-class'".match(attribute)); // 测试单引号
console.log("class=some-class".match(attribute)); // 测试无引号
console.log("disabled".match(attribute)); // 测试无属性值

// [
//   'class="some-class"',
//   'class',
//   '=',
//   'some-class',
//   undefined,
//   undefined,
//   index: 0,
//   input: 'class="some-class"',
//   groups: undefined
// ]
// [
//   "class='some-class'",
//   'class',
//   '=',
//   undefined,
//   'some-class',
//   undefined,
//   index: 0,
//   input: "class='some-class'",
//   groups: undefined
// ]
// [
//   'class=some-class',
//   'class',
//   '=',
//   undefined,
//   undefined,
//   'some-class',
//   index: 0,
//   input: 'class=some-class',
//   groups: undefined
// ]
// [
//   'disabled',
//   'disabled',
//   undefined,
//   undefined,
//   undefined,
//   undefined,
//   index: 0,
//   input: 'disabled',
//   groups: undefined
// ]

// 1.3. 解析自闭合标签

function parseStartTagEnd(html) {
  let end = html.match(startTagClose);
  const match = {};
  if (end) {
    match.unarySlash = end[1];
    html = html.substring(end[0].length);
    return match;
  }
}

console.log(parseStartTagEnd("></div>")); // { unarySlash: '' }
console.log(parseStartTagEnd("/><div></div>")); //{ unarySlash: '/' }

// 1.4 截取结束标签
console.log("</div>".match(endTag)); // 测试结束标签 => [ '</div>', 'div', index: 0, input: '</div>', groups: undefined ]
console.log("<div></div></div>".match(endTag)); // 测试结束标签 => null

// 1.5 截取文本
// 一般情况情况 "hello world</div>"
// 特别情况 "<1<2</div>"
// 处理思路就是将 < 之前的字符截取完了之后，剩余的模板不符合任何需要被解析字段的类型 就说明这个<是文本的一部分
function parseHtml(params) {
  let text, rest, next;
  if (textEnd >= 0) {
    // 解析文本
    rest = html.slice(textEnd);
    while (
      !endTag.test(rest) &&
      !startTagOpen.test(rest) &&
      !comment.test(rest) &&
      !conditionalComment.test(rest)
    ) {
      // < in plain text, be forgiving and treat it as text
      next = rest.indexOf("<", 1);
      if (next < 0) break;
      textEnd += next;
      rest = html.slice(textEnd);
    }
    text = html.substring(0, textEnd);
  }

  if (textEnd < 0) {
    text = html;
  }

  if (text) {
    advance(text.length);
  }

  if (options.chars && text) {
    options.chars(text, index - text.length, index);
  }
}
