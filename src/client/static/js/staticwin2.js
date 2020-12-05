'use strict';

var app = new Vue({
  el: '#vueapp',
  methods: {
    handleChange(val) {
      console.log(val);
    }
  },
  data: {
    activeNames: []
  }
});
