// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// Multilanguage support for Vue see https://www.npmjs.com/package/vue-i18n
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);

// Enable components from element.ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

const Bus = require('./utils/vuebus');
Vue.use(Bus);

import adminpage from './AdminPage.vue'

Vue.config.productionTip = false


/* eslint-disable no-new */
window._init = function( texts ){
  
    const messages = JSON.parse( JSON.stringify(texts) );
    delete messages.meta;

    const i18n = new VueI18n({
      locale: 'en', // set locale
      messages // set locale messages
    })

  new Vue({
    i18n,
    components: { adminpage },
    data: function(){
      return {
      };
    },
    template: '<adminpage />'
  }).$mount('#app');
}
