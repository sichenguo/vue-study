// 代码字符串转换为执行函数
function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}



// "with(this){return _c('div',{attrs:{"id":"demo"}},[_c('h1',[_v("我是标题")]),_v(" "),_c('p',[_v("我是内容1")])])}"