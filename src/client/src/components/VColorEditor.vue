<!--
    VColorEditor

    The color editing dialog.

    The dialog is self sufficient and is triggered by "this.$bus.$emit( 'editColors', obj: Object )" where "obj" has a colors property and a handler.
-->

<template>
    
    <div class="vcoled" :class="{hidden: !visible}" :style="posstyle">
        <!-- Header -->
        <div class="vcoled-head">
            {{ $t('menu.cav') }}
        </div>
        <!-- wrapper for settings -->
        <div class="vcoled-wrap">
            <table>
                <tr v-for="s in sections">
                    <td v-if="s.title" colspan="3" class="vcol-sect-head">{{ $t('coled.'+s.id) }}</td>
                    <td v-if="s.text">
                        {{s.text}}
                    </td>
                    <td v-if="s.text">
                        <el-switch 
                            v-model="s.visible" 
                            :disabled="s.visible && s.parent.visible==1"
                            v-on:change="toggleItemVisible(s)"></el-switch>
                    </td>
                    <td v-if="s.text">
                        <el-color-picker 
                            :style="{visibility: s.visible?'visible':'hidden'}"
                            popper-class="smcolpick"
                            v-model="s.color" 
                            size="mini"
                            v-on:change="setCol(s, s.color )"
                            v-on:active-change="(c)=>{setCol(s,c)}"
                        ></el-color-picker>
                    </td>
                </tr>
            </table>
        </div>
        <!-- button bar -->
        <div class="vcoled-btns">
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

export default {
    name: 'VColorEditor',
    props: {
    },
    computed: {
        posstyle(){
            return 'top:'+ this.pos.top +'px; left:'+ this.pos.left+'px;'
        },
    },
    methods: {
        toggleItemVisible(s){
            if (s.visible) {
                s.parent.visible++
            } else {
                s.parent.visible--
            }
            this.handler.setItemVisible(s.type, s.id, s.visible)
        },
        done: function(){
            this.visible = false;
            this.$bus.$emit('editColorsDone');
        },
        save: function(){
            this.done();
        },
        cancel: function(){
            this.reset();
            this.sections.forEach(s=>{
                s.visible = s.origVis;
                this.handler.setItemVisible(s.type, s.id, s.visible);
            });
            this.done();
        },
        setCol: function(s, ncol){
            if(ncol){
                s.color = ncol;
            } else {
                s.color = s.original;
            }
            this.handler.setColor(s.type, s.id, null, s.color);
        },
        reset: function(){
            this.sections.forEach(s=>{
                s.visible = true;
                if(s.original && s.color!=s.original){
                    this.setCol(s, s.original);
                }
                this.handler.setItemVisible(s.type, s.id, s.visible);
            });
            this.handler.resetColors();
        },
        setPos(ps){
            this.pos.left = Math.max(ps.left-300, 0)
            this.pos.top = Math.max(ps.top+10, 0)
        },
    },
    watch: {
    },
    data: function(){
        let self = this;
        this.$bus.$on('editColors', function(obj){
            let cls = obj.colors;
            self.handler = obj.handler;
            self.win = obj.win
            self.win.coled = self
            self.setPos(self.win.manuscript._window.pos)
            self.sections = [];
                
            Object.keys(cls).forEach(k=>{
                let s = cls[k];
                let sect = { id:k, title:k, visible: 0 };
                self.sections.push(sect);
                Object.keys(s).forEach(k1=>{
                    let sct = s[k1];
                    let typ = { 
                        id:k1, 
                        type:k, 
                        text:k1, 
                        color:sct.color, 
                        original:sct.color,
                        visible: sct.visible,
                        origVis: sct.visible,
                        ids: sct.ids
                    };
                    if(sct.color && typ.text!='filler'){
                        if (sct.visible) {
                            sect.visible++
                        }
                        typ.parent = sect
                        self.sections.push(typ);
                    }
                });
            });
            if(self.handler){
                self.visible = true;
            }
        });

        this.$bus.$on('editColorsDone', ()=>{
            this.visible=false;
        });

        return {
            sections: [],
            handler: null,
            visible: false,
            win: null,
            pos: {
                top: 10,
                left: 0,
            },
        }
    }
};
</script>

<style>

    .vcoled.hidden {
        display: none;
    }
    
    .vcol-sect-head {
        font-size: 14px;
    }

    .vcoled-head {
        font-size: 22px;
        border-bottom: solid 1px #888;
        padding-bottom: 7px;
    }
    
    .vcoled {
        display: inline-block;
        position: absolute;
        background-color: #545c64;
        color: white;
        padding: 5px;
        font-size: 12px;
        z-index: 2000;
        box-shadow: 5px 5px rgba(0, 0, 0, .4);
        -webkit-transition: height 10s;
        transition: height 10s;
    }
    
    .vcoled-wrap .el-color-picker__trigger {
        border: none;
    }

</style>

