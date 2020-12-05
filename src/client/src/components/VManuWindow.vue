<!--
    VManuWindow

    Utilises the VWindow component to display a manuscript inside a floating window.

    There are basically two subcomponents, the first, VManuscriptView, is responsible for the SVG graphic rendering.
    The second, VInfos, displays the information panel.

    The settings component, VSettings, is also used when required.
-->

<template>
    <VWindow
        :position="{top: manuscript._window.pos.top, left:manuscript._window.pos.left, width:manuscript._window.pos.width, height:winheight}"
        :title="mtitle"
        :resizeable="canresize"
        :headerbackground = "headerbackcol"
        v-on:ready="windowLoaded"
        v-on:move="moved"
        v-on:close="hide"
        v-on:resizestart="resizestart"
        v-on:resized="resized"
        v-on:userclick="$emit('userclick')"
    >

    <div slot="header" class="manu-header">
        <div class="manu-title" :style="{'width': (manuscript._window.pos.width-25)+'px'}">{{ mtitle }}</div>
        <div class="manu-controls" v-if="manuscript && manuscript.itemcount && !manuscript.errors.length">
            <span class="buttons">

              <el-tooltip v-if="canresize" class="item" effect="dark" :content="$t('settings.display')" placement="bottom" :hide-after="1000">
                  <el-dropdown size="small" split-button type="primary" v-on:command="setDisplayMode">
                    {{$t(viewModeKey)}}
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="logarithmic">{{$t('settings.dispBR')}}</el-dropdown-item>
                        <el-dropdown-item command="proportional">{{$t('settings.dispP')}}</el-dropdown-item>
                        <el-dropdown-item command="equal">{{$t('settings.dispACE')}}</el-dropdown-item>
                    </el-dropdown-menu>
                    </el-dropdown>               
              </el-tooltip>

              <el-tooltip v-else class="item" effect="dark" :content="$t('settings.display')" placement="bottom" :hide-after="1000">
                  <span class="simpleMode">{{$t('settings.dispBR')}}</span>          
              </el-tooltip>              

              <el-tooltip class="item" effect="dark" :content="$t('screen.title')" placement="bottom" :hide-after="1000">
                <el-button 
                    type="primary" 
                    size="small"
                    icon="el-icon-picture"
                    v-on:click.stop="screenshot"
                ></el-button>
              </el-tooltip>    
              <el-tooltip v-if="canresize" class="item" effect="dark" :content="$t('menu.labels')" placement="bottom" :hide-after="1000">
                <el-button 
                    type="primary" 
                    size="small"
                    icon="el-icon-setting"
                    :disabled="!showSettingsButton"
                    v-on:click.stop="toggleSettings"
                ><i class="el-icon-arrow-down"></i></el-button>
              </el-tooltip>    

              <el-tooltip v-if="canresize" class="item" effect="dark" :content="$t('menu.cav')" placement="bottom" :hide-after="1000">
                <el-button 
                    type="primary" 
                    size="small"
                    icon="el-icon-edit"
                    :disabled="!showSettingsButton"
                    v-on:click.stop="editColors"
                ><i class="el-icon-arrow-down"></i></el-button>
              </el-tooltip>    

<!--
              <el-tooltip v-if="isParallel && canresize && showSettingsButton" class="item" effect="dark" :content="$t('menu.parallel')" placement="bottom" :hide-after="1000">
                <el-button 
                    :type="displayparallel?'primary':'secondary'" 
                    size="small"
                    icon="el-icon-rank"
                    v-on:click.stop="toggleParallel"
                ></el-button>
              </el-tooltip>    
-->

              <el-tooltip v-if="!canresize" class="item" effect="dark" :content="$t('menu.labels')" placement="bottom" :hide-after="1000">
                <el-button 
                    type="primary" 
                    size="small"
                    icon="el-icon-setting"
                    v-on:click.stop="setalllabels"
                ></el-button>
              </el-tooltip> 

              <!-- <VSwitch 
                :value="showalllabels"
                text="Labels"
                v-if="!canresize"
                v-on:switch="setalllabels"
              ></VSwitch> -->
            </span>
            <span class="labels">
                <el-switch
                    style="display: block"
                    v-model="displaymode"
                    active-color="#DF0101"
                    inactive-color="#009440"
                    :active-text="$t('mode.advanced')"
                    :inactive-text="$t('mode.easy')"
                    v-on:change="advancedswitch">
                </el-switch>
            </span>
        </div>
    </div>

<!-- when manuscript has errors-->
    <div v-if="manuscript.errors.length" class="errors">

        <div class="head">{{ $t('error.title') }}</div>
        <div> {{ $t('error.text1') }} </div>
        <div> {{ $t('error.text2') }} </div>
        <div><img src="../../static/images/error.png" alt="Buch"/></div>
    </div>
    
    <div v-if="manuscript && !manuscript.errors.length" class="manuwinbody">
        <VManuscriptView 
            class="manuview"
            v-if="manuscript.itemcount"
            :id="domid"
            :width="manuscript._window.pos.width"
            :height="getViewHeight()"
            :manuscript="manuscript"
            :mode="dispMode"
            :showparallel="displayparallel"
            v-on:itemselect="selectitem"
            v-on:sectionselect="selectsection"
            v-on:select="resetinfos"
            v-on:click="resetinfos"
            v-on:setheight="setViewHeight"
            :showlabels="showlabels"
            :showculabels="showculabels"
            :showseglabels="showseglabels"
            :showtitle="showtitle"
            :bookWidth="bookWidth"
            ref="manuview"
        ></VManuscriptView>

<!-- Logoanzeige -->              
<!--         <div v-if="manuscript.meta.manuPTB=='PTB'">
            <a href="http://www.paratexbib.eu/" target="_blank">
            <el-tooltip class="item" effect="dark" :content="$t('manu.logo')" placement="bottom" :hide-after="4000">

                <img class="logo1" src="../../static/images/ptblogo_grau.png" alt="PTB-Logo"/>

            </el-tooltip> 
            </a>
        </div>
        <div v-else>
            <a href="https://www.irht.cnrs.fr/" target="_blank">
            <el-tooltip class="item" effect="dark" :content="$t('manu.logo')" placement="bottom" :hide-after="4000">
                
                <img class="logo2" src="../../static/images/irhtlogo_grau.png" alt="IRHT-Logo"/>
                
            </el-tooltip>  
            </a>   
        </div> -->

        <div class="noinhalte" v-if="!manuscript.itemcount">
          {{$t('nocontent.message')}} 
        </div>
        <VInfos
            ref="infos"
            v-if="showinfos"
            :button="showInfoEnlarge!=0"
            @button="fitInfoArea()"
            :type="infotype"
            :obj="infoobj"
            :height="0"
        ></VInfos>
      </div>      
          <!-- settings dialog -->
          <VSettings class="winsetts"
            :style="{left: Math.min(2, 0-Math.min(210, manuscript._window.pos.left))+'px'}"
            v-if="canresize && showsettings"
            :settings="getsettings"
            :visible="true"
            :canall="false"
            v-on:done="saveSettings"
            v-on:change="applySetting"
            v-on:reset="resetSettings"
            v-on:allsettings="allsettingsToggle"
            :titlekey="'menu.labels'"
          ></VSettings>
    </VWindow>
</template>

<script>
import VWindow from './VWindow';
import VManuscriptView from './VManuscriptView';
import VInfos from './VInfos';
import VSwitch from './VSwitch';
import VSettings from './VSettings';

import settingsmixin from '../utils/settingsmixin';

function Debouncer(timeout){
    let tout;
    this.run = function(fn){
        if(tout){
            clearTimeout(tout);
        }
        tout = setTimeout(fn, timeout);
    };
}

let mvDebounce = new Debouncer( 50 );

let manuid=0;

const heightAdjuster = 37;

const defaultIHeight = 220;

export default {
    name: 'VManuWindow',
    components: {
        VWindow,
        VManuscriptView,
        VInfos,
        VSwitch,
        VSettings
    },
    mixins: [settingsmixin],
    mounted: function(){
        this.updateDisplayMode();
        
        if (this.manuscript._new) {
            delete this.manuscript._new
            let mde = this.$store.getters.getEditMode
            if (mde!='easy') {
                this.$nextTick( ()=>{
                    this.advancedswitch( false )
                    this.$nextTick( ()=>{
                        this.advancedswitch( true )
                    })
                })
            }
            this.manuscript._window.pos.iheight = this.iHeight;
            this.$store.commit('updateManuscript', this.manuscript );
        }
        else if (!this.manuscript._window.pos.iheight) {
            this.manuscript._window.pos.iheight = this.iHeight;
            this.$store.commit('updateManuscript', this.manuscript );
        }
        if (this.manuscript._window.pos.iheight){
            this.iHeight = this.manuscript._window.pos.iheight
        }
        this.emptyClick()
    },
    props:{
        top: {},
        left: {},
        manuscript:{}
    },
    computed:{
        mtitle: function(){
            return this.$store.getters.manutitle(this.manuscript);
        },
        canresize: function(){
            this.displaymode = this.manuscript ? this.manuscript._window.settings.mode=='advanced' : false;
            return this.displaymode;
        },
        headerbackcol: function(){
            return this.canresize?'#7F7F7F':'#C0C0C0';
        },
        showculabels: function(){
            return this.setting('showculabels');
        },
        showseglabels: function(){
            return this.setting('showseglabels');
        },
        showtitle: function(){
            return this.setting('showtitle');
        },
        showinfos: function(){
            return this.setting('showinfos');
        },
        dispMode: function(){
            return this.setting('segDispMode');
        },
        showalllabels: function(){
            return this.showculabels || this.showseglabels;
        },
        infoHeight: function(){
            if(this.showinfos){
                return this.iHeight;
            }
            return 0;
        },
        winheight: function(){
            return this.manuscript._window.pos.height;
        }
    },
    methods:{
        emptyClick(){
        // Emulate click to hide white space
            this.$refs.manuview.svgselect();
        },
        windowLoaded: function(win){
            this.manuscript._window.component = win;
            this.manuscript._window.wrapper = this;
        },
        hide: function(){
            if (!this.showSettingsButton) {
                this.toggleSettings();
            }
            this.manuscript._window.visible=false;
            this.$store.commit('updateManuscript', this.manuscript );
            this.$bus.$emit('editColorsDone');
        },
        doselect: function(type, obj){
            this.infotype=type;
            this.infoobj=obj;
        },
        selectitem: function(i){
            this.doselect('item', i.inhalt);
        },
        selectsection: function(s){
            this.doselect('section', s.meta);
        },
        selectblock: function(ps){
            if(ps){
                if(ps.type=='cu'){
                    this.doselect('section', ps.meta);
                } else {
                    this.doselect('item', ps.meta);
                }
            }
        },
        resetinfos: function(){
            this.$bus.$emit('select.block', {wid: this.domid} );
            this.doselect('manuscript', this.manuscript.meta );
        },
        togglelabels: function(){
            this.showlabels = !this.showlabels;
        },
        moved: function(pos){
            mvDebounce.run( ()=>{
                ['top', 'left', 'width', 'height'].forEach(p=>{
                    this.manuscript._window.pos[p] = pos[p];
                });
                this.$store.commit('updateManuscript', this.manuscript );
                if (this.coled) {
                    this.coled.setPos(this.manuscript._window.pos)
                }
            } );
        },
        resizestart: function(e){
            this.scaleFactor = e.height
        },
        resized: function(e){
            this.scaleFactor = e.height / this.scaleFactor
//            this.iHeight = Math.max(255, this.iHeight*this.scaleFactor );
            this.moved(e);
        },
        savesvg: function(){
        },
        screenshot: function(){
            let svg = document.getElementById(this.domid).getElementsByTagName('svg')[0].outerHTML;
            this.$emit('screenshot', svg );
        },
        advancedswitch: function(vl){
            const newMode = vl ? 'advanced' : 'easy';
            if (newMode == this.manuscript._window.settings.mode) {
                return;
            }
            if(vl){
                this.manuscript._window.settings.mode = 'advanced';
                if(!this.$store.getters.isGlobalEditing){
                    this.$store.commit('updateManuscript', this.manuscript );        
                }
                this.$bus.$emit('winInAdvMode', (setts)=>{
                    this._tsetts = this.$store.getters.settingsCopy( this.getsettings );
                    this.setSettings( setts );
                });
                this.updateDisplayMode();
            } else {
                this.resetToDefaults();
                this.manuscript._window.settings.mode = 'easy';
                this.$refs.manuview.svgselect();
            }
        },
        resetIHeight: function(){
            this.iHeight = defaultIHeight;
        },
        resetToDefaults: function(){
            this.manuscript._window.settings = this.$store.getters.settingsCopy( this.$store.getters.defaultSettings );
            this.manuscript._colors = {};
            this.iHeight = defaultIHeight;
            this.$store.commit('restoreWindowSize', this.manuscript );
            this.$store.commit('updateManuscript', this.manuscript ); 
            this.$refs.manuview.redraw();
        },
        setalllabels: function(){
            let vl = !this.setting('showculabels');
            this.setting('showculabels', vl );
            this.setting('showseglabels', vl );
            this.$store.commit('updateManuscript', this.manuscript );        
        },
        onSettingChanged: function(key, val){
            let origVal = this.setting(key);
            if(key=='showinfos' && val!=origVal){
                if(val){
                    this.manuscript._window.pos.height = this.manuscript._window.pos.height + this.iHeight;
                } else {
                    this.manuscript._window.pos.height = this.manuscript._window.pos.height - this.iHeight;
                }
                this.$store.commit('updateManuscript', this.manuscript );
            }
            if ( key == 'segDispMode' ) {
                this.updateDisplayMode( val );
            }
        },
        setting: function(key, val){
            if(val!=undefined){
                this.onSettingChanged(key, val);
                this.manuscript._window.settings[key] = val;
                this.$store.commit('updateManuscript', this.manuscript );        
            } else {
                return this.manuscript._window.settings[key];
            }
        },
        setItemVisible: function(key, type, visible){
            this.manuscript._colors = this.manuscript._colors || {};
            let clrs = this.manuscript._colors;
            clrs[key] = clrs[key] || {};
            clrs[key][type] = clrs[key][type] || { ids:{}};
            clrs[key][type].visible = visible;
            this.resetinfos();
            this.$refs.manuview.redraw();
        },
        resetColors: function(){
             this.manuscript._colors = {}
            this.$refs.manuview.buildSections();
            this.editColors();
            setTimeout(()=>{
                this.$store.commit('updateManuscript', this.manuscript );
            }, 500);
        },
        setColor: function(key, type, id, color){
            this.manuscript._colors = this.manuscript._colors || {};
            let clrs = this.manuscript._colors;
            clrs[key] = clrs[key] || {};
            clrs[key][type] = clrs[key][type] || { ids:{}};
            if(id){
              clrs[key][type].ids[id] = clrs[key][type].ids[id] || {};
              clrs[key][type].ids[id].color = color;
            } else {
              clrs[key][type].color = color;
            }
            this.$refs.manuview.redraw();
            setTimeout(()=>{
                this.$store.commit('updateManuscript', this.manuscript );
            }, 500);
        },
        editColors: function(){
//            this.showSettingsButton = false;
            this.$bus.$emit('editColors', {
                handler: this,
                colors: this.manuscript._colors,
                win: this,
            });
        },
        setDisplayMode: function(newMode){
          this.setting( 'segDispMode', newMode );
          this.displayparallel = (newMode=='equal' ? false : true)
          this.$bus.$emit('select.block', {})
          // this.updateDisplayMode( newMode );
        },
        updateDisplayMode: function( mode ){
          const newMode = mode || this.setting( 'segDispMode' );
          switch (newMode) {
              case 'logarithmic':
                this.viewModeKey = 'settings.dispBR'
                this.displayparallel = true
                break;
            case 'proportional':
                this.viewModeKey = 'settings.dispP'
                this.displayparallel = true
                break;
            case 'equal':
                this.viewModeKey = 'settings.dispACE'
                this.displayparallel = false
                break;
          }
        },
        toggleParallel: function(){
            this.displayparallel = !this.displayparallel;
        },
        setViewHeight( h ){
            this.manuscript._window.pos.height = h + this.infoHeight + heightAdjuster;
            this.manuscript._window.pos.iheight = this.infoHeight;
            this.$store.commit('updateManuscript', this.manuscript );
        },
        setInfoAreaHeight( h ){
            const vh = this.getViewHeight();
            this.iHeight = h;
            this.manuscript._window.pos.height = vh + this.infoHeight + heightAdjuster;
            this.manuscript._window.pos.iheight = this.infoHeight;
            this.$store.commit('updateManuscript', this.manuscript );
        },
        getViewHeight(){
            return this.manuscript._window.pos.height - this.infoHeight - heightAdjuster;
        },
        fitInfoArea: function(){
            this.setInfoAreaHeight( this.showInfoEnlarge + 10 );
            this.showInfoEnlarge = 0
        },
        checkInfoSize(){
            if (this.$refs.infos) {
                this.showInfoEnlarge = this.$refs.infos.$el.clientHeight
                this.fitInfoArea()
            }
        },
    },
    data: function(){
        this.$bus.$on('editColors', ()=>{
            this.showSettingsButton = false;
        });
        this.$bus.$on('editColorsDone', ()=>{
            this.coled = null
            this.showSettingsButton = true;
        });
        this.$bus.$on('select.block', evt=>{
            if(evt.wid==this.domid){
                setTimeout( ()=>{
                    this.checkInfoSize()
                }, 50)
                this.selectblock( evt.pos );
            }
        });
        manuid++;
        return {
            width: 400,
            height: 400,
            bookWidth: 200,
            iHeight: defaultIHeight,
            scaleFactor: 1,
            infoobj: null,
            atop: 0,
            aleft: 0,
            infotype: '',
            showlabels: true,
            showInfoEnlarge: 0,
            displaymode: true,
            domid: 'manu_'+manuid,
            displayparallel: true,
            viewModeKey: 'settings.dispBR',
            isParallel: true, // window._showParallel
            coled: null,
        };
    }
};
</script>

<style>

.manu-header {
    padding: 5px 0;
}

.manu-title {
    padding-bottom: 8px;
}

.manu-controls {
    color: white;
    padding: 3px 7px;
    display: flex;
    border-top: solid rgba(0,0,0,0.2) 1px;
    padding-top: 9px;
}

.manu-controls .buttons {
    flex-grow: 1;
}

.manuwinbody {
    position: relative;
    height: 100%;
    overflow-y: hidden;
}

.vwin-body .winsetts {
    position: absolute;
    top: 86px;
    left: 2px;
}

.buttons > div {
    margin-right: 10px;
}

.head {
    font-size: 22px;
    font-weight: bold;
    padding-bottom: 20px;
}

div.errors {
    text-align: center;
    margin-top: 50px;
}

.noinhalte {
  margin: 40px;
  font-size: 23px;
}

.simpleMode {
    font-size: 14px;
    padding-right: 20px;
    color: #409EFF;
}

.labels {
    padding-top: 4px;
}

.logo1 {
    position:absolute;
    top: 40px;
    left: 10px;
    width: auto;
    height: 18px;
}

.logo2 {
    position:absolute;
    top: 40px;
    left: 10px;
    width: auto;
    height: 14px;
}

</style>

