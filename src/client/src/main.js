// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';

// Enable components from element.ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

let locales={};
let loc_langs = ['en', 'de', 'fr'];

//import locale from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale/lang/de';
//import locale from 'element-ui/lib/locale/lang/fr';

Vue.use(ElementUI, {locale});

import App from './App';


const Bus = require('./utils/vuebus');
Vue.use(Bus);

const axios = require('axios');

import Vuex from 'vuex';
Vue.use(Vuex);

// Multilanguage support for Vue see https://www.npmjs.com/package/vue-i18n
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);
let messages;

let storage = window.localStorage;

let winOffset = 40;
let winDim = {width: 800, height: 735};
let winPositions=[];
let cls = Math.max(Math.round(window.innerWidth/winDim.width), 2);
let clsoff = (window.innerWidth-winDim.width)/(cls-1);
let rws = Math.max(Math.round(window.innerHeight/winDim.height), 2);
let rwsoff = window.innerHeight/rws;

// Ensure we have a language
let ln = storage.getItem('StruvimanLanguage');
if(!ln){
  storage.setItem('StruvimanLanguage', 'en');
}


let calcPositions = ()=>{
  let y=5;
  // Recalculate incase browser is resized.
  cls = Math.max(Math.round(window.innerWidth/winDim.width), 2);
  clsoff = (window.innerWidth-winDim.width)/(cls-1);
  rwsoff = window.innerHeight/rws;

  winPositions=[];
  for(let i=0; i<rws; i++){
    let x=5;
    for(let j=0; j<cls; j++){
      winPositions.push(
        {top: y, left: Math.min(x, window.innerWidth-winDim.width-10), width: winDim.width, height: winDim.height}
      );
      x = x + clsoff;
    }
    y = y+rwsoff;
  }
};
calcPositions();

function nextWindowPos( pos ){
  let offs = Math.floor(pos/winPositions.length) * winOffset;
  let ps = winPositions[pos%winPositions.length];
  let rt = {};
  ['top','left','height','width'].forEach(k=>{
    rt[k] = ps[k]
  });
  rt.top = rt.top + offs;
  rt.left = rt.left + offs;
  return rt;
}

function saveSettings(setts){
  storage.setItem('StruvimanSettings', JSON.stringify(setts||{}));
}

function saveToStorage(sessid, manuscripts){
  storage.setItem('StruvimanSession', sessid);
  let c=[], w=[];
  manuscripts.forEach(m=>{
    c.push(m._window.component);
    w.push(m._window.wrapper);
    m._window.component = null;
    m._window.wrapper = null;
  });
  try {
    storage.setItem('StruvimanManuscripts', JSON.stringify(manuscripts||[]));
  } catch(ex) {
    console.log(ex);
    console.log( "ms", manuscripts );
  }
  manuscripts.forEach((m,i)=>{
    m._window.component = c[i];
    m._window.wrapper = w[i];
  });
  c=null;
  w=null;
}

//storage.removeItem('StruvimanManuscripts');

function saveManuscript(manu, session, all){
  saveToStorage( session, all );
}

// Version identifier.
/*
 Change this to delete existing saved manuscripts. 
 Usefull when the manuscript structure changes such that errors will occur when
  reloading manuscripts from an older version.
*/
const struviversion = "1.3.0";
function checkStruViVersion(){
  let svKey = 'StruViManVersion';
  let sv = storage.getItem(svKey);
  if(sv != struviversion){
    storage.setItem('StruvimanManuscripts', '[]');
  }
  storage.setItem(svKey, struviversion);
}
checkStruViVersion();

const defaultSettings = {
  mode: 'easy',
  showculabels: true,
  showseglabels: true,
  showtitle: true,
  showinfos: true,
  segDispMode: 'logarithmic'
};

const originalSettings = {
  mode: 'easy',
  showculabels: true,
  showseglabels: true,
  showtitle: true,
  showinfos: true,
  segDispMode: 'logarithmic'
};

const store = new Vuex.Store({
  state: {
    manuscripts: [],
    session: '',
    sessionlang: storage.getItem('StruvimanLanguage', 'en'),
    editMode: 'easy',
    isGlobalEditing: false,
    settings: {}
  },
  getters: {
    isGlobalEditing: state => state.isGlobalEditing,
    getEditMode: state => state.editMode,
    manuscripts: state => state.manuscripts,
    session: state => state.session,
    sessionlang: state => state.sessionlang,
    manutitle: state => (m) => {
      if(m){
        return m.meta.manuSignatur + ' - ' + m.meta.manuTitel + 
                                    ' - diktyon ' + m.meta.manuReferenz;
      }
      return "";
    },
    defaultSettings: state => {
      let r = {};
      Object.keys(defaultSettings).forEach(k=>{
        r[k] = defaultSettings[k];
      });
      return r;
    },
    originalSettings: state => {
      let r = {};
      Object.keys(originalSettings).forEach(k=>{
        r[k] = originalSettings[k];
      });
      return r;
    },
    settings: state => state.settings,
    settingsCopy: state => (src, dst) => {
      let r = dst || {};
      let s = src || state.settings;
      Object.keys(s).forEach(k=>{
        r[k] = s[k];
      });
      return r;
    },
    setting: (state)=>(key)=>{
      return state.settings[key];
    },
    cookies: state => {
      return state.cookies;
    }
  },
  mutations: {
    // Global editing
    setGlobalEditing: (state, isglobal)=>{
      state.isGlobalEditing = isglobal?true:false;
    },
    // Editing mode
    setEditMode: (state, newMode) => {
      state.editMode = newMode;
    },
    // Set the language
    setLanguage: (state, lang)=>{
      state.sessionlang = lang;
      storage.setItem('StruvimanLanguage', lang);
    },
    // Mutations
    addManuscript: (state, manu) => {
      let copySetts = ()=>{
        let rt = {};
        Object.keys(state.settings).forEach(k=>{
          rt[k] = state.settings[k];
        });
        return rt;
      };
      manu._window = manu._window || {
        visible: true,
        pos: nextWindowPos( state.manuscripts.length ),
        settings: copySetts()
      };
      state.manuscripts.push( manu );
      saveToStorage( state.session, state.manuscripts );
    },
    updateManuscript: (state, manu) => {
      saveManuscript(manu, state.session, state.manuscripts );
    },
    deleteManuscript: (state, manu) => {
      let ps = state.manuscripts.indexOf( manu );
      if( ps>-1 ){
        state.manuscripts.splice(ps, 1);
        saveToStorage( state.session, state.manuscripts );
      }
    },
    saveManuscripts: (state) => {
      saveToStorage( state.session, state.manuscripts );
    },
    restoreWindowSize: (state, manu)=>{
      manu._window.pos.height = winDim.height;
      manu._window.pos.width = winDim.width;
    },
    tileVisibleManuscripts: (state) => {
      let i=0;
      calcPositions();
      let positions = ['top','left', 'height','width'];
      state.manuscripts.forEach(m=>{
        if(m._window.visible){
          let newpos = nextWindowPos( i );
          m._window.pos = m._window.pos || {};
          positions.forEach(p=>{
            m._window.pos[p] = newpos[p];
          });
          m._window.wrapper.resetIHeight();
          m._window.wrapper.emptyClick();
          m._window.component.focus();
          i++;
        }
      });
      saveToStorage( state.session, state.manuscripts );
    },
    showall: (state)=>{
      state.manuscripts.forEach(m=>{
        m._window.visible = true;
      });
      saveToStorage( state.session, state.manuscripts );
    },
    closeall: (state)=>{
      state.manuscripts.forEach(m=>{
        m._window.visible = false;
      });
      saveToStorage( state.session, state.manuscripts );
    },
    deleteall: (state)=>{
      state.manuscripts = [];
      saveToStorage( state.session, state.manuscripts );
    },
    setSession: (state, sessid) => {
      if(sessid!=state.session){
        state.manuscripts = [];
        state.session = sessid;
        saveToStorage( state.session, state.manuscripts );
        state.settings = defaultSettings;
        saveSettings(state.settings);
      }
    },
    init: (state) => {
      state.manuscripts = JSON.parse( storage.getItem('StruvimanManuscripts', '[]') );
      state.manuscripts = state.manuscripts || [];
      state.session = storage.getItem('StruvimanSession', 'NoSession');
      state.settings = JSON.parse( storage.getItem('StruvimanSettings') );
      state.settings = state.settings || defaultSettings;
      state.cookies = JSON.parse( storage.getItem('StruvimanCookies', 'false') );
    },
    setSetting: (state, args )=>{
      state.settings[args[0]] = args[1];
      saveSettings(state.settings);
    },
    updateSettings: (state, vals)=>{
      Object.keys(vals).forEach(k=>{
        state.settings[k] = vals[k];
      });
      saveSettings(state.settings);
    },
    acceptcookies: (state) => {
      state.cookies = true;
      storage.setItem('StruvimanCookies', 'true')
    }
  }
});




Vue.config.productionTip = false;

/* eslint-disable no-new */
window._init = function( sessid, err, newManuscript ){
console.log('sessid', sessid );
console.log('newManuscript', newManuscript );

  store.commit('init' );
  store.commit('setSession', sessid );
  if(newManuscript){
    newManuscript._new=true
    store.commit('addManuscript', newManuscript );
  }
  axios.get('/admin/texts').then(r=>{
      messages = r.data.texts;
      window._start( err );
  });

};

window._start = function( err ){
console.log("start", store.getters.session );
console.log("manuscripts", store.getters.manuscripts );


    const i18n = new VueI18n({
      locale: storage.getItem('StruvimanLanguage', 'en'), // set locale
      messages // set locale messages
    });

  new Vue({
    i18n,
    el: '#app',
    components: { App },
    store: store,
    data: function(){
      return {
        error: err
      };
    },
    template: '<App/>'
  });
};
