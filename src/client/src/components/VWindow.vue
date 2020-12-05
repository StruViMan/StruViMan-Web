<!--
    VWindow

    A window-ing component. Provides the basic functionality for a window.

    The main slot is rendered in the window body.

    Use the "Header" slot to override the header contents.

    Uses VWinResizer for resizing.

-->
<template>
    <div class="vwindow-wrap" :style="{top: tp+'px', left: lft+'px', 'background-color': backgroundcolor, 'z-index':zindx}">
        <div class="vwindow" :style="{'background-color': backgroundcolor}" >
            <div class="vwin-head"
                v-on:mousedown="startdrag"
                 :style="{'background-color': headerbackground}"
            >
                <slot name="header">
                        {{title}}
                </slot>
                <span class="btns">
                        <el-button size="mini" icon="el-icon-close" v-on:click.stop="close"></el-button>
                </span>
            </div>
            <div v-show="!resizing" class="vwin-body" ref="body" :style="{width: width+'px', height: height+'px'}"
                v-on:mousedown="winfocus"
            >
                <slot></slot>
            </div>
            <div v-if="resizing" class="resizelayer" :style="{width: rwidth+'px', height: rheight+'px'}"></div>
        </div>
        <VWinResizer
            type="right"
            :value="width"
            :min="800"
            :enabled="resizeable"
            v-on:resize="resize"
            v-on:resized="resized"
        ></VWinResizer>
        <VWinResizer
            type="left"
            :value="lft"
            :max="width+left-800"
            :enabled="resizeable"
            v-on:resize="resize"
            v-on:resized="resized"
        ></VWinResizer>
        <VWinResizer
            type="top"
            :value="tp"
            :max="height+top-700"
            :enabled="resizeable"
            v-on:resize="resize"
            v-on:resized="resized"
        ></VWinResizer>
        <VWinResizer
            type="bottom"
            :value="height"
            :min="700"
            :enabled="resizeable"
            v-on:resize="resize"
            v-on:resized="resized"
        ></VWinResizer>
    </div>
</template>

<script>
import VWinResizer from '@/components/VWinResizer';

let zindexCounter=5;
let windoze=[];
export default {
    name: 'VWindow',
    components: {
        VWinResizer
    },
    mounted: function(){
        if(!this.zindx){
            this.zindx = zindexCounter++;
            windoze.push(this);
        }
        this.updatePosition( this.position );
        this.$emit('ready', this);
    },
    props: {
        title: {
            default: 'Title'
        },
        backgroundcolor: {
            default: '#fff'
        },
        headerbackground: {
            default: '#C0C0C0'
        },
        resizeable: {
            default: false
        },
        position: {}
    },
    computed: {
        tp: function(){ return this.rtop || this.top; },
        lft: function(){ return this.rleft || this.left; }
    },
    methods: {
        startdrag: function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            this.userclick();
            this.focus();
            this.dragoffset.x = e.screenX;
            this.dragoffset.y = e.screenY;
            this.$emit('startmove', {});
            document.getElementsByTagName('body')[0].addEventListener('mousemove', this.drag );
            document.getElementsByTagName('body')[0].addEventListener('mouseup', this.enddrag );
        },
        enddrag: function(e){
            document.getElementsByTagName('body')[0].removeEventListener('mousemove', this.drag);
            document.getElementsByTagName('body')[0].removeEventListener('mouseup', this.enddrag);
            this.$emit('moved', {
                    top: this.top,
                    left: this.left,
                    width: this.width,
                    height: this.height
                });
        },
        drag: function(e){
            let t = Math.max( this.top + ( e.screenY - this.dragoffset.y ), 0 );
            let l = this.left + ( e.screenX - this.dragoffset.x );
            if(l != this.left){
                this.dragoffset.x = e.screenX;
            }
            if(t != this.top){
                this.dragoffset.y = e.screenY;
            }
            if((this.top!=t) || (this.left!=l)){
                this.left = l;
                this.top = t;
                this.$emit('move', {
                    top: this.top,
                    left: this.left,
                    width: this.width,
                    height: this.height
                });
            }
        },
        resizestart: function(e){
            this.rwidth = this.width;
            this.rheight = this.height;
            this.rleft = this.left;
            this.rtop = this.top;
            this.focus();
            this.resizing = true;

            this.$emit('resizestart', {
                top: this.top,
                left: this.left,
                width: this.width,
                height: this.height,
                original: e
            });
        },
        resize: function(e){
            let diff;
            if(!this.resizing){
                this.resizestart();
            }
            switch (e.type){
                case 'right':
                    this.rwidth = e.value;
                    break;
                case 'left':
                    diff = e.value - this.left;
                    this.rwidth = this.width - diff;
                    this.rleft = e.value;
                    break;
                case 'bottom':
                    this.rheight = e.value;
                    break;
                case 'top':
                    diff = e.value - this.top;
                    this.rheight = this.height - diff;
                    this.rtop = e.value;
                    break;
            }
        },
        resized: function(e){
            switch (e.type){
                case 'right':
                    this.width = this.rwidth;
                    break;
                case 'left':
                    this.left = this.rleft;
                    this.width = this.rwidth;
                    break;
                case 'bottom':
                    this.height = this.rheight;
                    break;
                case 'top':
                    this.top = this.rtop;
                    this.height = this.rheight;
                    break;
            }
            this.$emit('resized', {
                top: this.top,
                left: this.left,
                width: this.width,
                height: this.height,
                original: e
            });
            this.rleft = 0;
            this.rtop = 0;
            this.resizing = false;
        },
        close: function(){
            this.$emit('close');
        },
        userclick: function(){
            this.$emit('userclick');
        },
        winfocus: function(){
            this.userclick();
            this.focus();
        },
        focus: function(e){
            if(e){
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            if(windoze.length<2){
                return;
            }
            let z = this.zindx;
            let nz = this.zindx;
            windoze.forEach(w=>{
                if(w.zindx>z){
                    nz = Math.max(w.zindx, nz);
                    w.zindx = w.zindx-1;
                }
            });
            
            if(nz!=z){
                this.$emit('totop', this )
            }
            this.zindx = nz;
        },
        updatePosition: function(nval){
            if ( nval ) {
                ['top', 'left', 'width', 'height'].forEach( k=>{
                    if(nval[k]) {
                        this[k] = nval[k];
                    }
                });
            }
        }
    },
    watch: {
        position: function(nval, oval){
            this.updatePosition( nval );
        }
    },
    data: function(){
        return {
            dragging: false,
            resizing: false,
            dragoffset: {},
            zindx: 0,
            rwidth:0,
            rheight:0,
            rtop:0,
            rleft:0,
            top: 0,
            left: 0,
            width: 300,
            height: 400
        };
    }
};
</script>

<style>

.vwindow-wrap {
    position: absolute;
    top: 0px;
    left: 400px;
    border: solid 1px #bbb;
 
    margin-bottom: 20px;
}

.resizelayer {
    background-color: rgba(255, 255, 255, 0.6);
}

.vwindow {
}

.vwindow .vwin-head {
    position: relative;
    border-bottom: solid 1px #bbb;
    color: white;
    padding-left: 5px;
    cursor: all-scroll;
}

.vwin-head > .btns {
    position: absolute;
    top: 0px;
    right: 3px;
}

.vwin-head > .btns .el-button {
    padding: 1px;
}

.vwin-head > * {
    margin: 0;
}

.vwindow .vwin-body{
}

</style>