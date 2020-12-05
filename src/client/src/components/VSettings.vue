<!--
    VSettings

    Responsible for both settings dialogs.

    If the "canall" property is set to true, then the "Change in all open windows" is displayed.

    All other properties are supplied via the "settings" property.

    To display the dialog, set the "visible" property to true.

    The constant variable "varTable" is a look-up table used to determine the visual label and the property type.
    If nothing is found via, the look-up table, then the default type is boolean.

-->

<template>
    
    <div class="vsettings" :class="{hidden: !visible}">
        <!-- Header -->
        <div class="vset-head">
            {{ $t(titlekey) }}
        </div>
        <!-- wrapper for settings -->
        <div class="vset-wrap">
            <table>
                <tr v-if="canall">
                    <td> {{ $t('menu.all') }} </td>
                    <td align=right> <el-switch v-model="doall"></el-switch> </td>
                </tr>
                <tr v-for="s in setts">
                    <td >{{ $t(s.text) }}</td>
                    <td >
                        <el-switch 
                            v-if="typeof s.val == 'boolean'"
                            v-model="s.val"
                            v-on:change="$emit('change', {name:s.name, val:s.val} )"
                        ></el-switch>
                        
                        
                        <el-select 
                            v-if="s.type == 'select'"
                            size="mini"
                            v-model="s.val"
                            v-on:change="$emit('change', {name:s.name, val:s.val} )"
                        >
                            <el-option 
                                v-for="o in s.options"
                                :key="o.val"
                                :label="$t(o.name)"
                                :value="o.val"
                            ></el-option>
                        </el-select>
                    </td>
                </tr>
            </table>
        </div>
        <!-- button bar -->
        <div class="vset-btns">
            <el-button 
                type="default"
                size="mini"
                v-on:click="reset"
            >Reset</el-button>
            <el-button 
                type="danger"
                size="mini"
                v-on:click="cancel"
            >Cancel</el-button>
            <el-button 
                type="success"
                size="mini"
                v-on:click="save"
            >OK</el-button>
        </div>
    </div>
    
</template>

<script>

const varTable = {
    "showculabels": {
        text: 'settings.pul',
        type: 'boolean'
    },
     "showseglabels": {
        text: 'settings.csl',
        type: 'boolean'
    },
    "showtitle": {
        text: 'settings.ti',
        type: 'boolean'
    },
    "showinfos": {
        text: 'settings.ia',
        type: 'boolean'
    },
    "segDispMode": {
        text: 'settings.display',
        type: 'select', 
        isall: true,
        options: [
            {name: 'settings.dispBR', val:'logarithmic'},            
            {name: 'settings.dispP', val:'proportional'},
            {name: 'settings.dispACE', val:'equal'}
/*
            ,{name: 'CU equal', val: 'sectionequal'},
            {name: 'Segment equal in CU', val: 'regionequal'}
*/
        ]
    }
};

export default {
    name: 'VSettings',
    props: {
        settings: {
            default: []
        },
        visible: {
            default: false
        },
        canall: {
            default: true
        },
        titlekey: {
            default: 'menu.settings'
        },
        startAsGlobal: {
            default: false
        }
    },
    computed: {
        setts: function(){
            if(!this.dsetts){
                let r = [];
                Object.keys(this.settings).forEach(k=>{
                    let o = {
                        name: k,
                        val: this.settings[k],
                        _orig: this.settings[k]
                    };
                    let t = varTable[k] || {};
                    o.text = t.text || k;
                    o.type = t.type || 'boolean';
                    if(o.type=='select'){
                        o.options = t.options;
                    }
                    if( (!t.isall) || (t.isall&&this.canall)){
                        r.push(o);
                    }
                });
                this.dsetts = r;
            }
            return this.dsetts;
        }
    },
    mounted: function(){
        if(this.startAsGlobal) {
            this.doall = true;
        }
    },
    methods: {
        change: function(key, value){
            this.$emit('change', {key:key, value:value});
        },
        reset: function(){
            this.dsetts = null;
            this.$emit('reset' );
        },
        save: function(){
            this.$emit('done', true );
            this.dsetts = null;
        },
        cancel: function(){
            this.$emit('done', false);
            this.dsetts.forEach(d=>{
                d.val = d._orig;
            });
        }
    },
    watch: {
        doall: function(newval, oldval){
            this.$emit('allsettings', newval );
        },
        visible: function(newval, oldval){
            this.doall = false;
        },
        canall: function(newval, oldval){
            if(newval!=oldval){
                this.dsetts = null;
            }
        }
    },
    data: function(){
        return {
            doall: false,
            dsetts: null
        }
    }
};
</script>

<style>

    .vset-head {
        font-size: 22px;
        border-bottom: solid 1px #888;
        padding-bottom: 7px;
    }
    
    .vsettings {
        background-color: #545c64;
        color: white;
        padding: 5px;
        font-size: 12px;
        z-index: 2000;
        box-shadow: 5px 5px rgba(0, 0, 0, .4);
        -webkit-transition: height 10s;
        transition: height 10s;
    }
    
    .vsettings.hidden {
        height: 0;
        overflow: hidden;
        padding: 0;
    }

    .vset-btns {
        border-top: solid 1px #888;
        padding-top: 7px;
    }
    
</style>

