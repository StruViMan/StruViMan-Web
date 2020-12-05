<!--
    VInfos

    Renders the information view for the required content type (Manuscript, production unit or piece of content).

    The relevant meta information json object is passed as a property as is the content type. Using this information, 
    the component then uses the static variable "infoTable" to determine what to render.

-->

<template>
    <div v-if="type" class="info-wrap">
        <div v-if="showheader" class="infohead"> {{ header }} <button v-if="button" @click.stop="$emit('button')">+</button> </div>
        <div class="infotable" :style="stile" >
            <div v-for="(info, i) in getTable(type)" :key="info.name" class="inforow" :class="{even: i%2}">
                <div class="infcol-name" > {{ info.name }} </div>
                <div class="infcol-det" v-html="info.value"></div>
            </div>
        </div>
    </div>
</template>

<script>


const infoTable = {
    'manuscript': [
/*
        {name:'mShelfmark', key:'manuSignatur'}
        ,{name:'mTitle', key:'manuTitel'}
        ,{name:'mReference', 
            key:'manuReferenz',
            formatter: (str)=>{
                return 'diktyon ' + str;
            }
        }
*/
        ,{name:'mScribe', key:'manuKopist'}
        ,{name:'mComments', key:'manuKommentar'}
        ,{name:'mPTB', key:'manuPTB'}
        ,{name:'mLink', 
            key:'manuLink',
            formatter: (str)=>{
                return '<a href="'+str+'" target="_blank">'+str+'</a>';
            }
        }
    ],
    'section': [
        {name:'sNumber', key:'cuNummer'}
        ,{name:'sFolio', key:'cuFolio'}
        ,{name:'sTitle', key:'cuTitel'}
        ,{name:'sReference', key:'cuReferenz'}
        ,{name:'sType', key:'cuTyp'}
        ,{name:'sDate', key:'cuDatum'}
        ,{name: 'sMaterialSupport', key: 'cuMaterialSupport'}
        ,{name:'sScribe', key:'cuKopist'}
        ,{name:'sComments', key:'cuKommentar'}
    ],
    'item': [
        {name:'iNumber', key:'inhaltNummer'}
//        ,{name:'iPages', key:'inhaltPages'}
        ,{name:'iFolio', key:'inhaltFolio'}
        ,{name:'iReference', key:'inhaltReferenz'}
        ,{name:'iWork', key:'inhaltWerk'}
        ,{name:'ID', key:'inhaltId'}
        ,{name:'iCategory', key:'inhaltKategorie'}
        ,{name:'iDetails', key:'inhaltDetails'}
        ,{name:'iDate', key:'inhaltDatum'}
        ,{name:'iScribe', key:'inhaltKopist'}
        ,{name:'iSection', key:'inhaltBezugCU'}
        ,{name:'iComments', key:'inhaltKommentar'}
    ]
};

export default {
    name: 'VInfos',
    props: {
        type: {
            default: ''
        },
        obj: {},
        showheader: {
            type: Boolean,
            default: true
        },
        button: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number,
            default: 190
        }
    },
    methods: {
        prop: function(prop){
            let r = this.obj[prop.key] || '';
            if(typeof r != "string"){
                r= "";
            } else {
                r = r.replace(/[\"\<\>]/g, '').trim();
            }
            if(prop.formatter){
                r = prop.formatter( r );
            }
            return r;
        },
        getTable: function(type){
            const t = this.table[type];
            const ret = [];
            t.forEach( info => {
                let vl = this.prop(info);
                if(vl){
                    ret.push( {
                        name: this.$t( 'info.' +info.name.toLowerCase() ),
                        value: vl
                    });
                }
            } );
            return ret;
        }
    },
    computed: {
        header: function(){
            if(this.type=='item'){
                return this.$t('manu.pci');
            }
            if(this.type=='section'){
                return this.$t('manu.pui');
            }
            return this.$t('manu.mai');
        },
        stile: function(){
            if (this.height) {
                return 'height: '+(this.height-20)+'px'
            }
            return ''
        },
    },
    data: function(){
        return {
            table: infoTable
        };
    }
};

</script>

<style scoped >
    .info-wrap {
        padding: 0 10px;
    }
    
    .infotable {
        width: 100%;
        overflow-y: auto;
    }
    
    .infohead {
        font-weight: bold;
        text-decoration: underline;
    }

    .infohead button {
        margin-left: 10px;
    }
    
    .inforow {
        font-size: 11px;
        line-height: 16px;
        display: flex;
        padding: 3px 0;
    }
    
    .inforow > div {
        padding: 0 2px;
    }
    
    .infcol-name {
        width: 110px;
        flex-grow: 0;
        flex-shrink: 0;
    }
    
    .infcol-det {
        margin-left: 2px;
        flex-grow: 1;
    }
    
    .even > div {
        background-color: #ddd;
    }
</style>

