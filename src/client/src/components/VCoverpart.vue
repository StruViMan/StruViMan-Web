<!--
    Vcoverpart

    Renders either the top or bottom cover SVG.
-->

<template>
    <g v-if="type=='top'">
        <rect :x="x" :y="y" :width="width/2" :height="height" :fill="color" :rx="height/2"  />
        <rect :x="x+(height/2)" :y="y" :width="width-(height/2)" :height="height/2" :fill="color"   />
        <rect :x="x" :y="y+(height/2)" :width="width-(height/2)" :height="height/2" :fill="color"   />
        <rect :x="x+backwidth" :y="y+(height/2)" :width="width" :height="height" fill="#fff" :rx="height/2"   />
    </g>
    <g v-else>
        <rect :x="x" :y="y" :width="width/2" :height="height" :fill="color" :rx="height/2"  />
        <rect :x="x+(height/2)" :y="y+(height/2)" :width="width-(height/2)" :height="height/2" :fill="color"   />
        <rect :x="x" :y="y" :width="width-(height/2)" :height="height/2" :fill="color"   />
        <rect :x="x+backwidth" :y="y-(height/2)" :width="width" :height="height" fill="#fff" :rx="height/2"   />
    </g>
</template>

<script>
export default {
    props: {
        type: {
            default: 'top'
        },
        color: {
            default: '#925d09'
        },
        x: {
            default: 0
        },
        y: {
            default: 0
        },
        width: {
            default: 200
        },
        height: {
            default: 40
        },
        backwidth: {
            default: 30
        }
    },
    computed: {
    }
};    
</script>

