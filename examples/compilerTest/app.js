/* global Vue */

/**
 * Actual demo
 */

new Vue({
  el: "#demo",

  data: {
    commits: null,
    isShow: true
  },

  created: function() {},

  watch: {
    currentBranch: "fetchData"
  },

  filters: {},

  methods: {}
});
