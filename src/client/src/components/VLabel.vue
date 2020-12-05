<!--
    VLabel

    Renders a label for either a production unit or piece of content.
    
-->
<template>
    <g>


       <polygon v-if="select" 
           :points="select.points"
           :fill="select.color"
           opacity="0.4"
       />

        <text   v-if="text"
                :x="x" :y="y" 
                :fill="color" 
                :text-anchor="anchor"
                font-size="10"
                v-on:mouseenter="mouseenter"
                v-on:mouseleave="mouseleave"
                v-on:click.stop="doclick"
        >{{ text }}</text>
        <line v-if="srcx && srcy" :x1="srcx" :y1="srcy" :x2="x" :y2="y-(h/2)+3" :stroke="color" stroke-width="1"/>
    </g>
</template>

<script >

    
export default {
    name: 'VLabel',
    props: {
        x: {},
        y: {},
        h: {
            default: 12
        },
        color: {
            default: '#000'
        },
        hovercolor: {
            default: '#00f'
        },
        linehovercolor: {
        },
        anchor: {
            default: 'start'
        },
        maxwidth: {
            default: 170
        },
        text: {},
        srcx: {},
        srcy: {},
        viewid: {
            default: 0
        },
        labelid: {
            default: 0
        }
    },
    computed: {
        colr: function(){
            if(this.hover){
                return this.hovercolor;
            }
            return this.color;
        },
        linecolr: function(){
            if(this.hover){
                return this.linehovercolor || this.hovercolor;
            }
            return this.color;
        }
    },
    methods: {
        mouseenter: function(event){
            this.hover = true;
            this.$emit('enter', event);
        },
        mouseleave: function(event){
            this.hover = false;
            this.$emit('leave', event);
        },
        doclick: function(){
            this.$emit('select');
        }
    },
    data: function(){
        this.$bus.$on('labelselect', evt=>{
            if(this.select && this.viewid==evt.vid) {
                this.select = false;
            }
            if(evt.id==this.labelid){
                this.select = evt.select;
            }
        });
        return {
            hover: false,
            w: 200,
            t: null,
            select: false
        };
    }
};
    
</script>

<style scoped>
    text {
        cursor: pointer;
    }
</style>




