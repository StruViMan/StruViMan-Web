<template>
    <g v-if="pos.visible">

        <rect :x="pos.x" :y="pos.y" :width="pos.w" :height="pos.h" :fill="pos.color" :style="'opacity:'+opac+';'"
            v-on:mouseenter="enter"
            v-on:mouseleave="leave"
            v-on:click.stop="select"
        ></rect>

        <rect :x="pos.x" :y="pos.y + pos.h - 0.5" :width="pos.w" :height="0.5" fill="#000" :style="'opacity:'+opac+';'"
            v-on:click.stop="select"
        ></rect>

        <rect v-if="pos.borderLeft" 
            :x="pos.x" :y="pos.y" :width="pos.borderLeft" :height="pos.h" fill="#000" :style="'opacity:'+opac+';'"
            v-on:click.stop="select"
        ></rect>
       
        <polyline v-if="slctbox" 
            :points="slctbox.points"
            fill="none"
            :stroke="slctbox.color"
            opacity="1"
            dtroke-width="2"
        />
       
        <polygon v-if="slct && pos.label.visible && showlabel" 
           :points="slct.points"
           :fill="slct.color"
           opacity="0.4"
       />

        <VLabel 
            :srcx="pos.srcx" :srcy="pos.srcy"
            :x="pos.label.x" :y="pos.label.y"
            :text="pos.label.text" 
            :labelid="pos.label.lid" 
            :viewid="pos.label.vid" 
            :anchor="pos.anchor || 'start'"
            :color="lcol"
            v-if="pos.label && pos.label.visible && showlabel"
            v-on:enter="enter"
            v-on:leave="leave"
            v-on:select="select()"
        ></VLabel>
    </g>
</template>

<script>
import VLabel from './VLabel';

let gSelected;

export default {
    name: 'VManuBlock',
    components: {
        VLabel
    },
    mounted: function(){
        this.pos.el = this;
        this.$bus.$on('block.hover', this.handleHoverEvent );
    },
    props: {
        pos: {},
        showlabel: {
            default: true
        }
    },
    computed: {
    },
    methods: {
        getLcol: function(){
            this.opac = 1;
            this.slct = undefined;
            this.slctbox = undefined;
            if(this.pos.selected) {
                this.lcol = '#000';
                this.slct = {
                    color: '#0F0',
                    points: this.labelpoints( this.pos.label )
                };
            } else if(this.pos.hover) {
                this.lcol = '#00F';
            } else {
                this.opac = 0.8;
                this.lcol =  '#000';
            }
        },
        handleHoverEvent: function(ev){
            if(ev.id == this.pos.id){
                this.setHover( ev.val, ev.ignoreChild );
            }
        },
        hoverel: function(ps, vl, ignoreChildren){
            if(ps.el){
                ps.el.setHover( vl, ignoreChildren );
            } else {
                ps.hover = vl;
            }
        },
        setHover: function(vl, ignoreChildren){
            this.pos.hover = vl;
            if(!ignoreChildren){
                (this.pos.children || []).forEach( c => {
                    this.$bus.$emit('block.hover', {id: c.pos.id, val:vl, ignoreChild:ignoreChildren });
                });
            }
            if(this.pos.parent) {
                this.$bus.$emit('block.hover', {id: this.pos.parent.pos.id, val:vl, ignoreChild:true });
            }
            this.getLcol();
        },
        setSelect: function(vl){
            this.pos.selected = vl;
            this.getLcol();
        },
        enter: function(event){
            this.setHover( true );        
            this.slctbox = {
                color: '#00F',
                points: this.pospoints( this.pos, 1 )
            };
            this.$emit('enter', {pos:this.pos, event:event, wid:this.pos.wid} );
            this.$bus.$emit('select.enter', {pos:this.pos, event:event, wid:this.pos.wid} );
        },
        leave: function(event){
            this.setHover( false );
            this.$emit('leave', {pos:this.pos, event:event, wid:this.pos.wid} );
            this.$bus.$emit('select.leave', {pos:this.pos, event:event, wid:this.pos.wid} );
        },
        select: function(){
/*
            if(gSelected){
                gSelected.setSelect( false );
            }
            gSelected = this;
*/
            this.$bus.$emit('select.block', {pos:this.pos, wid:this.pos.wid} );
            this.setSelect( true );
        },
        pointStr: function(x, y){
            return x+', '+y;
        },
        points: function(p, offset){
            let ret = '';
            let off = offset!=undefined?offset : 4;

            ret += this.pointStr(p.x-off, p.y-off);
            ret += ' '+this.pointStr(p.x+p.w+off, p.y-off);
            ret += ' '+this.pointStr(p.x+p.w+off, p.y+p.h+off);
            ret += ' '+this.pointStr(p.x-off, p.y+p.h+off);
            ret += ' '+this.pointStr(p.x-off, p.y-off);
            return ret;
        },
        pospoints: function(p, offset){
            let p2 = {
            x: p.x,
            y: p.y,
            w: p.w,
            h: p.h
            };
            if(this.selectedSection){
            p2.w = this.bookWidth;
            }
            return this.points( p2, offset );
        },
        labelpoints: function(l, offset){
            let ret;
            let p = {
            x: l.x,
            y: l.y-l.h +5,
            w: l.w,
            h: l.h-5
            };
            if(this.pos.anchor=='end'){
//                p.w = textlen(l.text);
                p.x = p.x - p.w;
            }
            ret = this.points( p, offset );
            return ret;
        }
    },
    data: function(){
        this.$bus.$on('select.block', (evt)=>{
            const ps = evt.pos;
            if(this.pos && this.pos.selected) {
                if(!ps || ps.id != this.pos.id){
                    this.setSelect( false );
                }
            }
            this.getLcol();
        });
        return {
            opac: 0.5,
            lcol: undefined,
            slct: undefined,
            slctbox: undefined
        };
    }
}
</script>




