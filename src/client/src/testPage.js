// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Enable components from element.ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

import XMLFiles from './XMLFiles'

Vue.config.productionTip = false

/* eslint-disable no-new */
window._init = function(fls){
console.log('init 2', fls );
console.log('vue', Vue );
console.log('Test', XMLFiles );

  new Vue({
    el: '#app',
    components: { XMLFiles },
    data: function(){
      return {
        files: fls
      };
    },
    template: '<XMLFiles :xmls="files" />'
  });
}
