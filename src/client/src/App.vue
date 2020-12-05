<!--

      App

      Main component for the Struviman application.

      Renders the main menu bar as well as it's buttons and the language selector VLangSwitcher.

      Manages visibility of manuscripts and renders a VManuWindow for all visible manuscripts.

      Also holds the colour editing component VColorEditor which is subsequently used by ALL the manuscript views.

      Responsible for generating screenshots and associated dialog.

-->



<template>
  <div class="app main">
      <div class="manumenu" v-show="showManus"
      v-on:mouseleave="hideManuMenu"
      v-on:mouseenter="reshowManuMenu"
      >
        <table v-if="manuscripts.length">
          <tr class="mitem" v-for="(m, i) in manuscripts"
              v-on:click.stop="focusManuscript(m)"
              v-on:dblclick.stop="showManuscript(m)"
          >
            <td class="mbtns">
              <el-tooltip class="item" effect="dark" :content="$t('tab.select')" placement="right" :hide-after="1000">
              <input 
                v-if="manuscripts.length>1"
                v-model="m.selected"
                v-on:click.stop=""
                v-on:dblclick.stop=""
                type="checkbox" 
              >
              </el-tooltip>

              <el-tooltip class="item" effect="dark" :content="$t('tab.delete')" placement="right" :hide-after="1000">              
              <i class="el-icon-delete"
                v-on:click.stop="deleteManuscript(m, i)"
              ></i>
              </el-tooltip>

              <el-tooltip class="item" effect="dark" :content="$t('tab.open')" placement="right" :hide-after="1000">
              <i class="el-icon-view"
                v-on:click.stop="showManuscript(m)"
              ></i>
              </el-tooltip>

            </td>
            <td class="mtitle">
               <div>{{ getTitle(m) }}</div>
               <VInfos v-if="selectedManu==m"
                  :showheader="false"
                  :obj="m.meta"
                  :height="100"
                  type="manuscript"
               ></VInfos>
             </td>
          </tr>
          <tr class="mitem mall" v-if="manuscripts.length>1" style="background-color: #ddd;">
              <td class="mbtns" colspan="2">

              <el-tooltip class="item" effect="dark" :content="$t('tab.selectall')" placement="bottom" :hide-after="3000">
                <input 
                  v-model="allmanuscritsSelected"
                  v-on:click.stop="toggleSelectedManuscripts()"
                  v-on:dblclick.stop=""
                  type="checkbox" 
                ></el-tooltip>

              <el-tooltip class="item" effect="dark" :content="$t('tab.deleteall')" placement="bottom" :hide-after="3000">                  
                <i class="el-icon-delete"
                  v-on:click.stop="deleteSelectedManuscripts()"
                ></i>
              </el-tooltip>
                &nbsp;&nbsp;
                {{ $t('manuscripts.all') }}
              </td>
            </tr>
        </table>
        <table v-else>
          <tr class="" >
            <td>{{ $t('menu.noManu') }}</td>
          </tr>
        </table>
      </div>
      
      <div class="menu flx" :class="isadv?'mnuadv':''">

            <a href="/sample.html">
            <el-tooltip class="item" effect="dark" :content="$t('menu.samples')" placement="bottom" :hide-after="3000">
            <img src="../static/images/muster-mini.png" alt="StruViMan graphic" style="padding-right: 20px;"/></el-tooltip></a>

          <el-button type="text" class="wbutton" size="mini" v-on:click.stop="toggleManus">{{ $t('menu.manu') }}<i class="el-icon-arrow-down"></i> </el-button>
            <span class="menu-buttons flexfix">
              <el-tooltip class="item" effect="dark" :content="$t('menu.help')" placement="bottom" :hide-after="2000">
                  <el-button 
                    type="primary" 
                    icon="el-icon-question"
                    size="mini"
                    v-on:click="openwindow('help')"
                ></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('menu.settings')" placement="bottom" :hide-after="2000" 
                v-if="viewmode=='advanced'"
              >
                  <el-button 
                    type="primary" 
                    icon="el-icon-setting"
                    size="mini"
                    :disabled="!showSettingsButton"
                    v-on:click="toggleSettings"
                ><i class="el-icon-arrow-down"></i></el-button>
              </el-tooltip>
            </span>

            <span class="menu-buttons flexfix" v-if="manuscripts.length>1">
                <el-tooltip class="item" effect="dark" :content="$t('menu.tile')" placement="bottom" :hide-after="2000">
                  <el-button 
                      type="primary" 
                      icon="el-icon-menu"
                      size="mini"
                      v-on:click="tile"
                  ></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('menu.show')" placement="bottom" :hide-after="2000">
                  <el-button 
                    type="primary" 
                    icon="el-icon-circle-plus"
                    size="mini"
                    v-on:click="showall"
                ></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('menu.close')" placement="bottom" :hide-after="2000">
                  <el-button 
                    type="primary" 
                    icon="el-icon-remove"
                    size="mini"
                    v-on:click="closeall"
                ></el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('menu.delete')" placement="bottom" :hide-after="2000">
                  <el-button 
                    type="primary" 
                    icon="el-icon-delete"
                    size="mini"
                    v-on:click="deleteall"
                ></el-button>
              </el-tooltip>

            </span>

          <span class="flexfill"></span>
                <span >
                  <VLangSwitcher ></VLangSwitcher>
                </span>

              <span class="ws">{{ $t('menu.workspace') }}:&nbsp;&nbsp;</span>
              
              <el-tooltip :content="$t('menu.wstip')" placement="top">
                <el-switch
                    style="display: block; padding-top:3px;"
                    v-model="isadv"
                    active-color="#DF0101"
                    inactive-color="#009440"
                    :active-text="$t('menu.advanced')"
                    :inactive-text="$t('menu.easy')"
                >
                </el-switch>
              </el-tooltip>  
        </div>
        <div class="backgrnd">

          <VStartInfoEn  v-if="visibleManuscripts<1 && selectedLang=='en'" :backgroundStyle="bgrndinfoStyle"></VStartInfoEn>

          <VStartInfoDe  v-if="visibleManuscripts<1 && selectedLang=='de'" :backgroundStyle="bgrndinfoStyle"></VStartInfoDe>

          <VStartInfoFr  v-if="visibleManuscripts<1 && selectedLang=='fr'" :backgroundStyle="bgrndinfoStyle"></VStartInfoFr>

        </div>
        <div class="body" style="" v-show="visibleManuscripts>0">

            <VManuWindow  v-for="m in manuscripts"
                v-show="m._window.visible"
                :key="m._id"
                :manuscript="m"
                v-on:screenshot="screenshot"
                v-on:userclick="hideManuMenu"
          >
          </VManuWindow>
          <!-- settings dialog -->
          <VSettings class="mainsetts"
            v-if="isadv && showsettings"
            :settings="getsettings"
            :startAsGlobal="true"
            :visible="isadv && showsettings"
            v-on:done="saveSettings"
            v-on:change="applySetting"
            v-on:reset="resetSettings"
            v-on:allsettings="allsettingsToggle"
          ></VSettings>
          
          <!-- Color Editor -->
          <VColorEditor></VColorEditor>
          
          <el-alert
            v-if="!cookies"
            class="cookies"
            :title="$t('cookies.title')"
            type="info"
            :description="$t('cookies.message')"
            :close-text="$t('cookies.button')"
            v-on:close="cookiesclose"
            show-icon>
          </el-alert>
          
        </div>

      <div class="menu flx footer" :class="isadv?'mnuadv':''">
        <span class="left">          
          <a href="https://www.uni-muenchen.de" target="_blank">
          <el-tooltip class="item" effect="dark" content="Ludwig-Maximilians-Universität München" placement="bottom" :hide-after="3000">
          <img src="../static/images/lmulogo.png" alt="LMU-Logo" style="padding-left: 3px"/></el-tooltip></a>

          <a href="https://erc.europa.eu" target="_blank">
          <el-tooltip class="item" effect="dark" content="European Research Council" placement="bottom" :hide-after="3000">          
          <img src="../static/images/erclogo.png" alt="ERC-Logo"/></el-tooltip></a> 

          <a href="https://www.itg.uni-muenchen.de" target="_blank">
          <el-tooltip class="item" effect="dark" content="IT-Gruppe Geisteswissenschaften -
LMU Center for Digital Humanities" placement="bottom" :hide-after="3000">
          <img src="../static/images/itglogo.png" alt="ITG-Logo"/></el-tooltip></a>  

          <a href="http://www.paratexbib.eu" target="_blank">
          <el-tooltip class="item" effect="dark" content="Paratexts of the Bible" placement="bottom" :hide-after="3000">
          <img src="../static/images/ptblogo.png" alt="PTB-Logo"/></el-tooltip></a>       
        </span>
        <span class="right">
          <span v-on:click="openwindow('imprint')" class="footerlink">{{ $t('footer.imprint') }}</span>
          <span>&ndash;</span>
          <span v-on:click="openwindow('datalaw')" class="footerlink">{{ $t('footer.datalaw') }}</span>
          <span>&ndash;</span>
          <span v-on:click="openwindow('contact')" class="footerlink">{{ $t('footer.contact') }}</span>
          <span>&ndash;</span>
          <span v-on:click="openwindow('license')" class="footerlink">{{ $t('footer.license') }}</span>
        </span>      
      </div>

        <el-dialog :title="$t('screen.title')" :visible.sync="showScreenshot" width="847px">
            <div>
              {{$t('screen.text')}}
            </div>
            <img id="cpyimg" :src="scrshotSrc">
          <span slot="footer" class="dialog-footer">
          </span>
        </el-dialog>

        <!-- 
          The Windows
        -->
        <VWindow v-for="win in mywindows" v-bind:key="win.name"
            v-if="win.visible"
            :position="{top:win.top, left:win.left, width:win.width, height:win.height}"
            :title="$t(win.titlekey)"
            :resizeable="win.resizable"
            v-on:close="win.visible=false"
            v-on:startmove="win.iframeclass='iframedrag'"
            v-on:moved="winmoved($event, win)"
        >
            <iframe 
              :src="'/static/'+$t(win.frameurl)" 
              :class="'helpwin '+win.iframeclass"
            >
            </iframe>
        </VWindow>

        <div class="popover" 
          v-if="popup.vis" 
          style="position: absolute;" 
          :style="'left:'+popup.x+'px; top:'+popup.y+'px;'"
        >
          <VInfos
              type="item"
              :obj="popup.obj"
              :height="0"
          ></VInfos>
        </div>

    </div>
</template>

<script>
import VManuWindow from './components/VManuWindow';
import VSwitch from './components/VSwitch';
import VSettings from './components/VSettings';
import VInfos from './components/VInfos';
import VColorEditor from './components/VColorEditor';
import VLangSwitcher from './components/VLangSwitcher';
import VWindow from './components/VWindow';
import VStartInfoEn from './components/VStartInfoEn';
import VStartInfoDe from './components/VStartInfoDe';
import VStartInfoFr from './components/VStartInfoFr';

import settingsmixin from './utils/settingsmixin';

const axios = require('axios');

const canvg = window.canvg || "Canvg not found";

const textWindows = {
  help: {
    titlekey: 'help.wintitle',
    top: 100,
    left: 50,
    width: 700,
    height: 500,
    visible: false,
    frameurl: 'help.page',
    resizable: false,
    iframeclass: ''
  },
  imprint: {
    titlekey: 'imprint.wintitle',
    top: 100,
    left: 50,
    width: 500,
    height: 500,
    visible: false,
    frameurl: 'imprint.page',
    resizable: false,
    iframeclass: ''
  },
    datalaw: {
    titlekey: 'datalaw.wintitle',
    top: 100,
    left: 50,
    width: 500,
    height: 500,
    visible: false,
    frameurl: 'datalaw.page',
    resizable: false,
    iframeclass: ''
  },
    contact: {
    titlekey: 'contact.wintitle',
    top: 100,
    left: 50,
    width: 500,
    height: 500,
    visible: false,
    frameurl: 'contact.page',
    resizable: false,
    iframeclass: ''
  },
    license: {
    titlekey: 'license.wintitle',
    top: 100,
    left: 50,
    width: 500,
    height: 500,
    visible: false,
    frameurl: 'license.page',
    resizable: false,
    iframeclass: ''
  }
};

export default {
  name: 'App',
  components: {
    VManuWindow,
    VSwitch,
    VSettings,
    VInfos,
    VColorEditor,
    VLangSwitcher,
    VWindow,
    VStartInfoEn,
    VStartInfoDe,
    VStartInfoFr
  },
  mixins: [settingsmixin],
  created: function(){
    this.$store.commit('setEditMode', this.setting('mode'))
    this.isadv = (this.setting('mode') == 'advanced');
  },
  mounted: function(){
    this.manuscripts.forEach( (m,i)=>{
      m._id = i;
      m.selected = false;
    });
console.log('#### mounted', this.manuscripts );
  },
  computed:{
    manuscripts: function(){
      return this.$store.getters.manuscripts;
    },
    visibleManuscripts: function(){
      let ret = 0;
      this.manuscripts.forEach( m => {
        if ( m._window.visible ) {
          ret++;
        }
      });
      return ret;
    },
    bgrndinfoStyle: function(){
      const w = Math.min( 700, window.innerWidth*0.7 );
      const st = {
        width: w+'px',
        left: (window.innerWidth-w)/2 + 'px'
      };
      return st;
    },
    viewmode: function(){
      return this.setting('mode');
    },
    mywindows: function(){
      if(!this.wins){
        this.wins = [];
        Object.keys( textWindows ).forEach( ky=>{
          textWindows[ky].name = ky;
          this.wins.push( textWindows[ky] );
        });
      }
      return this.wins;
    }
  },
  methods: {
    getTitle: function(m){
      return this.$store.getters.manutitle(m);
    },
    focusManuscript: function(m){
      this.selectedManu = this.selectedManu!=m?m:null;
      if(m._window.visible){
        m._window.component.focus();
        this.$store.commit('updateManuscript', m );
      }
    },
    showManuscript: function(m){
      console.log('m._window.wrapper', m._window.wrapper)

      m._window.visible=true;
//      m._window.wrapper.advancedswitch( this.isadv );
      m._window.component.focus();

      this.$store.commit('updateManuscript', m );
    },
    deleteManuscript: function(m, i){
      this.$confirm(this.$t('delete.text1'), this.$t('delete.title'), {
          confirmButtonText: this.$t('delete.yes'),
          cancelButtonText: this.$t('delete.no'),
          type: 'warning'
        }).then(() => {
          this.$store.commit('deleteManuscript', m );
          this.$message({
            type: 'success',
            message: this.$t('delete.success1'),
          });
        }).catch(() => {
        });
    },
    tile: function(){
      this.$store.commit('tileVisibleManuscripts');
    },
    showall: function(){
      this.$store.commit('showall');
    },
    closeall: function(){
      this.$store.commit('closeall');
    },
    deleteall: function(){
      this.$confirm(this.$t('delete.text2'), this.$t('delete.title'), {
          confirmButtonText: this.$t('delete.yes'),
          cancelButtonText: this.$t('delete.no'),
          type: 'warning'
        }).then(() => {
          this.$store.commit('deleteall');
          this.$message({
            type: 'success',
            message: this.$t('delete.success2')
          });
        }).catch(() => {
        });
    },
    screenshot: function(svg){

      this.showScreenshot = true;
      this.scrshotSrc = undefined;
      axios.post('/api/ss', {b:svg}).then(
          rsp=>{
              if(rsp && rsp.data) {
                this.scrshotSrc = '/static/screenshots/'+rsp.data.file;

                this.$message({
                      message: 'Screenshot',
                      type: 'success'
                  });
              } else {
                  this.showScreenshot = false;
                  this.$message.error( 'Server: ' + r.data.msg );
              }
          },
          err=>{
              this.showScreenshot = false;
              this.$message.error( 'Server conn error: ' + err );
          }
      );
    },
    setViewmode: function(newMode){
      this.setting('mode', newMode);
      this.isadv = newMode == 'advanced';
      this.$store.commit('setEditMode', newMode)
    },
    showManuMenu: function(hide){
      if(hide){
        this.showManus = false;
        this.selectedManu = null;
      } else {
        this.showManus = true;
      }
    },
    hideManuMenu: function(){
      this._mhto = setTimeout(() => {
        this.showManuMenu( true );
        this._mhto = undefined;
      }, 500);
    },
    reshowManuMenu: function(){
      if(this._mhto) {
        clearTimeout( this._mhto );
      }
    },
    toggleManus: function(){
      this.showManuMenu( this.showManus );
    },
    cookiesclose: function(){
      this.cookies=false;
      this.$store.commit('acceptcookies');
    },
    openwindow: function(windowName ){
      textWindows[ windowName ].visible = true;
    },
    winmoved: function(event, win){
console.log('winmoved', event );
      ['top', 'left', 'width', 'height'].forEach(k=>{
        win[k] = event[k] || win[k];
      });
      win.iframeclass='';
    },
    toggleSelectedManuscripts: function(){
      this.manuscripts.forEach( m => {
        m.selected = !this.allmanuscritsSelected;
//console.log( m._id, m.selected );
      });
console.log( this.allmanuscritsSelected );
    },
    deleteSelectedManuscripts: function(){
      let delmanus=[];
      let nodelmanus = [];
      this.manuscripts.forEach( m => {
        if(m.selected) {
          delmanus.push(m);
        } else {
          nodelmanus.push(m);
        }
      });
      this.$confirm(this.$t('delete.text1'), this.$t('delete.title'), {
          confirmButtonText: this.$t('delete.yes'),
          cancelButtonText: this.$t('delete.no'),
          type: 'warning'
        }).then(() => {
          delmanus.forEach( m => {
            this.$store.commit('deleteManuscript', m );
          });
          this.allmanuscritsSelected = false;
          this.$message({
            type: 'success',
            message: this.$t('delete.success1'),
          });
        }).catch(() => {
        });
    }
  },
  watch: {
    isadv: function(newVal, oldVal){
      const nMode = newVal==true?'advanced':'easy'
      this.$store.commit('setEditMode', this.setting('mode'))
      this.setting('mode', nMode);
    }
  },
  data: function(){
    this.$bus.$on('open,window', winName=>{
      this.openwindow( winName );
    });
    this.$bus.$on('langchange', langIso=>{
      this.selectedLang = langIso;
    });
    this.$bus.$on('editColors', ()=>{
        this.showSettingsButton = false;
    });
    this.$bus.$on('editColorsDone', ()=>{
        this.showSettingsButton = true;
    });
    this.$bus.$on('segment.enter', evt=>{
      this.popup.x = evt.event.pageX + 5
      this.popup.y = evt.event.pageY + 5
      this.popup.vis = true
      this.popup.obj = evt.pos.meta
    });
    this.$bus.$on('segment.leave', evt=>{
      this.popup.vis = false
    });
    this.$bus.$on('winInAdvMode', (callback)=>{
      callback( this.getsettings );
    });
    return {
      scrshotSrc: '',
      showScreenshot: false,
      isadv: false,
      showManus: false,
      showsettings: false,
      selectedManu: null,
      cookies: this.$store.getters.cookies,
      wins: null,
      allmanuscritsSelected: false,
      selectedLang: this.$i18n.locale,
      popup: {
        x:0,
        y:0,
        vis: false,
        obj: {},
      },
    };
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#cpyimg {
    border: solid 1px;
    padding: 18px 2px;
    max-width: 100%;
}

.manumenu {
  position: absolute;
  top: 62px;
  left: 9px;
  background-color: #fff;
  z-index: 1999;
  padding: 5px;
  border: solid 1px black;
  border-radius: 4px;
  box-shadow: 5px 5px rgba(0,0,0,.4);
  max-height: 80vh;
  overflow-y: auto;
}

.manumenu .mitem {
    cursor: pointer;
}

.manumenu .mitem .info-wrap {
  background-color: white;
  border: solid 1px black;
  border-top: none;
}

.manumenu .mitem:hover .info-wrap {
  border-color: white;
}

.manumenu .mitem > td {
    padding: 7px;
}

.manumenu .mitem:hover {
  background-color: #cfeaf7;
}

.menu {
  background-color: #C0C0C0;
  padding: 12px 20px;
  margin: 0;
}

.mnuadv {
  background-color: #7F7F7F;
}


.menu-buttons {
  margin: 0 16px;
}

.menu-buttons button {
  padding: 7px 7px;
}

.menu .el-dropdown {
  color: #fff;
}

.manuItem {
  width: 300px;
  display: flex;
}

.manuItem .manu-txt {
  flex-grow: 1;
}

.mbtns {
  width: 70px;
}

.mtitle {
    font-size: 12px;
}

.manu-btns > i {
  color: #000;
  opacity: 0.5;
}

.manu-btns:hover > i {
  opacity: 1;
}

.menu .wbutton{
  color: white;
  font-size: 14px;
}

.flx {
  display: flex;
}

.flx .flexfix {
  flex-grow: 0;
  flex-shrink: 0;
}

.flx .flexfill {
  flex-grow: 1;
  flex-shrink: 1;
}

.footer {
  position: fixed;
  bottom: 4px;
  width: calc( 100vw - 16px);
  height: 31px;
  padding: 0px;
}

.left > a {
  padding-left: 3px;
}

.right {
  padding-top: 8px;
  text-align: right;
}

.footerlink {
  margin: 0 16px;
  cursor: pointer;
}

.footer > span {
    flex-grow: 1;
}

.footer img {
  height: 30px;
}

.body {
  position:relative; 
  width: calc(100vw - 16px); 
  height: calc( 100vh - 106px);
  overflow-y: auto;
  overflow-x: hidden;
}

.body .mainsetts {
  position: fixed;
  top: 61px;
  left: 8px;
}

.cookies {
  position: fixed;
  bottom: 100px;
  z-index: 9999;
  height: 100px;
  width: 50vw;
}

.helpwin {
  width: 98%;
  height: 98%;
  border: none;
}

.iframedrag {
  pointer-events: none;
}

.backgrnd {
  position: fixed;
  top: 60px;
  overflow: hidden;
  height: calc( 100vh - 99px);
  width: calc( 100vw - 16px);
  box-sizing: border-box;
  background: #ffdb6e;
  background: -moz-linear-gradient(top, #ffdb6e 0%, #ffe595 50%, #ffeebc 100%);
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffdb6e), color-stop(50%,#ffe595), color-stop(100%,#ffeebc));
  background: -webkit-linear-gradient(top, #ffdb6e 0%,#ffe595 50%,#ffeebc 100%);
  background: -o-linear-gradient(top, #ffdb6e 0%,#ffe595 50%,#ffeebc 100%);
  background: -ms-linear-gradient(top, #ffdb6e 0%,#ffe595 50%,#ffeebc 100%);
  background: linear-gradient(to bottom, #ffdb6e 0%,#ffe595 50%,#ffeebc 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffdb6e', endColorstr='#7db9e8',GradientType=0 );
}

.backgrnd > img {
  width: calc( 100vw - 16px);
  opacity: 0.5;
}

.bgrndinfo {
  font-size: 16px;
  position: absolute;
  top: 2vw;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 9px;
}

.bgrndinfo > div {
  text-align: center;
}

.popover {
  position: absolute;
  z-index: 999;
  z-index: 999;
  background-color: white;
  width: 400px;
  border: 2px solid black;
  padding: 2px 0;
}

.popover .infohead {
  display: none;
}

.popover .inforow {
  font-size: 8px;
}

.ws {
  font-size: 14px; 
  padding-top:5px;
  color: white;
}

</style>
