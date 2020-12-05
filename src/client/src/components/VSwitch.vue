<!--
    VSwitch

    A simple toggle button for boolean values. 
    
    Currently only used to toggle the visibility of the labels in easy mode.

-->
<template>
    <span class="vswitch">
        <el-button 
            type="success" 
            :size="size"
            v-if="istrue"
            v-on:click="$emit('switch', false)"
        >{{text}}</el-button>
        <el-button 
            type="warning"  plain
            :size="size"
            v-else
            v-on:click="$emit('switch', true)"
        >{{text}}</el-button>
    </span>    
</template>

<script>
export default {
    name: 'VSwitch',
    props: {
        value: {
            default: true
        },
        trueval: {
            default: true
        },
        text: {
            default: 'VSwitch'
        },
        size: {
            default: 'mini'
        }
    },
    computed: {
        istrue: function(){
            return this.value == this.trueval;
        }
    }
};
</script>

<style>
    
</style>
