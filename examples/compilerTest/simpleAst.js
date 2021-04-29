{
  /* <div>
  <p>{{ name }}</p>
</div> */
}

let astMap = 
{
  type: 1,
  tag: "div",
  parent: null,
  attrsList: [],
  static: false,
  staticRoot: false,
  children: [
    {
      type: 1,
      tag: "p",
      static: false,
      staticRoot: false,
      parent: { type: 1, tag: "div" },
      attrsList: [],
      children: [
        {
          type: 2,
          text: "{{name}}",
          static: false,
          expression: "_s(name)"
        }
      ]
    }
  ]
};

