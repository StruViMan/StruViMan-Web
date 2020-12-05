'use strict';

var app = new Vue({
    el: '#vueapp',
    methods: {
      select: function(vl) {
        if(this.sel==vl) {
          this.sel = 0;
        } else {
          this.sel = vl;
        }
      }
    },
    data: {
      sel: 0
    }
  });
