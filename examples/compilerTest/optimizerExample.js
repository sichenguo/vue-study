function isStatic(node: ASTNode): boolean {
  if (node.type === 2) {
    // expression 带变量的动态文本
    return false;
  }
  if (node.type === 3) {
    // text 不带变量的动态文本
    return true;
  }
  return !!(
    node.pre ||
    (!node.hasBindings && // no dynamic bindings 没有动态绑定
    !node.if &&
    !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in 不是内置标签 不能是slot或者是 component
    isPlatformReservedTag(node.tag) && // not a component 标签名必须是保留标签 例如 <div></div> 可以 但是<list></list> 不行
    !isDirectChildOfTemplateFor(node) && //
      Object.keys(node).every(isStaticKey)) // 节点中不存在动态节点才会有的属性 如果一个节点是静态节点 那么他的所有属性是存在一个范围的 例如 type tag attrsMap plain children attrs staticClass staticStyle
  );
}

function markStatic(node: ASTNode) {
  node.static = isStatic(node);
  if (node.type === 1) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i];
      markStatic(child);
      if (!child.static) {
        node.static = false;
      }
    }
  }
}



function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 静态根节点必须有子节点
    // 这个子节点不能是只有静态文本的子节点 否则优化成本将超过收益
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
  }
}