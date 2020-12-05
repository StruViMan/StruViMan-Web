<!--
    VLangEditTable

    Facilitates the maintenance of the i18n language keys and their translations.

    User can add, delete and edit the values via a pop-up dialog.
    Single translations can be edited by clicking on the word.

    The translations are only globally available after the user has clicked on save.
-->
<template>
<div >
    <el-table
    :data="filteredData"
    stripe
    :default-sort = "{prop: 'key', order: 'ascending'}"
    :height = "'calc( 100vh - 100px )'"
    v-on:row-dblclick = "dblclk"
    style="width: 100%">
        <el-table-column
          label=""
          width="60"
          >
                <template slot-scope="scope">
                    <i class="el-icon-edit" v-on:click.stop="doRowEdit(scope.row)"></i>
                    <i v-if="!meta[scope.row.key] || !(meta[scope.row.key] && meta[scope.row.key].preserve)" class="el-icon-delete" v-on:click.stop="deleteRow(scope.row)"></i>
                </template>
        </el-table-column>
        <el-table-column
          prop="key"
          label="Key"
          sortable
          >
                <template slot-scope="scope">
                    <div>
                        <div>
                            {{ meta[scope.row.key]?meta[scope.row.key].description:'no desc: '+scope.row.key }}
                        </div>
                        <div>
                            {{scope.row.key}}
                        </div>
                    </div>
                </template>
        </el-table-column>
        <el-table-column v-for="l in locales"
          :prop="l"
          :label=" $t('lang.'+l) "
          sortable
          >
            <template slot-scope="scope">
                <el-input 
                    v-if="scope.row.key==editPosition.key && l==editPosition.lang" 
                    v-model="scope.row[l]"
                    v-on:blur="saveEditPos( scope.row )"
                    ref="edtbtn"
                >
                </el-input>
                <span v-else v-on:click.stop="editItem(l, scope.row)">
                    {{scope.row[l]}}
                </span>
            </template>
        </el-table-column>
    </el-table>
    <div >
        <el-input v-model="filter" autofocus></el-input>
    </div>
    <div>
    </div>
    <div class="btns">
        <span>
            <el-button type="primary" icon="el-icon-plus" circle v-on:click="addRow()"></el-button>

            <el-button v-if="parallel" type="success" v-on:click="swapParallel()">Parallel Content is on</el-button>
            <el-button v-else type="primary" v-on:click="swapParallel()">Parallel Content is OFF</el-button>
        </span>
        <span class="rbtns">
            <el-button type="success" v-on:click.stop="showImpExp(false)">Export</el-button>
            <el-button type="success" v-on:click.stop="showImpExp(true)">Import</el-button>
        </span>
    </div>
    
    <el-dialog :title="impexp" :visible.sync="doimpexp">
        <div >
            <textarea v-model="iedata" class="impexp"></textarea>
        </div>
        <div v-if="imp">
            <el-button type="primary" @click="doImport()">Import</el-button>
        </div>
    </el-dialog>
    
    
    <el-dialog title="Edit" :visible.sync="editRow">
      <el-form >
        <el-form-item label="Key" >
            <span v-if="meta[editRow.key] && meta[editRow.key].preserve">
                {{ editRow.key }}
            </span>
          <el-input v-else v-model="editRow.key" autofocus auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Description" >
             <el-input type="textarea" v-model="editRow.desc"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.'+l)" v-for="l in locales">
             <el-input type="textarea" v-model="editRow[l]"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRow = false">Cancel</el-button>
        <el-button type="primary" @click="saveRowEdit()">OK</el-button>
      </span>
    </el-dialog>
    
</div>
</template>

<script>
const axios = require('axios');

// Helper function to get the keys for an object.
function keysForObject(obj, parentStr, keyStore){
    let ret = keyStore || {};
    let ps = parentStr || '';
    let ks;
    Object.keys(obj).forEach( k=>{
        let v = obj[k];
        ks = ps.length?ps+'.'+k : k;
        if(typeof v == 'object'){
            keysForObject( v, ks, ret);
        } else {
            ret[ks] = v;
        }
    });
    return ret;
}

// Helper function to get the value of an object, based on the key
function keyValue(obj, key){
    let o=obj;
    let v='';
    key.split('.').forEach( k=>{
        if(typeof o == 'object'){
            o = o[k];
        } else {
            o='';
        }
    });
    return o;
}

// Helper function to set the value of an object, based on the key
function setKeyValue(obj, key, val){
    let o=obj;
    let v='';
    let kys = key.split('.');
    kys.forEach( (k,indx)=>{
        if(indx<kys.length-1){
            if(!o[k]){
                o[k]={};
            }
            o=o[k];
        } else {
            o[k] = val;
        }
    });
}

  
export default {
    name: 'VLangEditTable',
    props: {
        texts: {}
    },
    mounted: function(){
        axios.get('/api/parallel').then(
            r=>{
                this.parallel = r.data.parallel;
            }
        );
    },
    computed: {
        locales: function(){
            if(!this.languages) {
                this.meta = this.vtexts.meta || {};
                delete this.vtexts.meta;
                this.languages = Object.keys(this.vtexts);
            }
            return this.languages;
        },
        vtexts: function(){
            return this.dbtexts || this.texts;
        },
        tabledata: function(){
            if(!this.matrix){
                let kys={};
                let mo;
                this.locales.forEach( l=>{
                    keysForObject( this.vtexts[l], '', kys );
                });
                this.matrix = [];
                Object.keys( kys ).forEach( k=>{
                    mo = { key:k };
                    this.locales.forEach( l=>{
                        mo[l] = keyValue( this.vtexts[l], k);
                    });
                    this.matrix.push( mo );
                });
            }
            return this.matrix;
        },
        filteredData: function() {
            let ret = [];
            if ( this.filter ) {
                this.tabledata.forEach( m => {
                    let r=false;
                    let f = this.filter.toLowerCase();
                    let str;
                    if( m.key.toLowerCase().indexOf(f)>=0) {
                        r = true;
                    }
                    if( !r ) {
                        this.locales.forEach( l => {
                            if( r ) return;
                            str = m[l] || '';
                            r = ( str.toLowerCase().indexOf(f)>=0 ) ;
                        });
                    }
                    if( !r ) {
                        if( this.meta[m.key] ) {
                            str = this.meta[m.key].description || '';
                            r = ( str.toLowerCase().indexOf(f)>=0 ) ;
                        }
                    }
                    if( r ){
                        ret.push( m );
                    }
                });
            } else {
                ret = this.tabledata;
            }
            return ret;
        }
    },
    methods: {
        swapParallel: function(){
            this.parallel = !this.parallel;
            if(this.parallel){
                axios.get('/api/setparallel/1').then();
            } else {
                axios.get('/api/setparallel/0').then();
            }
        },
        buildTexts: function(){
            let ret = {};
            this.locales.forEach( l=>{
                ret[l] = {};
                this.tabledata.forEach(mo=>{
                    setKeyValue( ret[l], mo.key, mo[l] );
                });
            });
            return ret;
        },
        editItem: function(lang, mo){
            this.editPosition = {key:mo.key, lang:lang, orig:mo[lang] };
            setTimeout(()=>{
                this.$refs.edtbtn[0].focus();
            }, 1);
        },
        saveEditPos: function( rw ){
            const changed = !(this.editPosition.orig == rw[this.editPosition.lang]);
            this.editPosition = {};
            if(!changed) {
                return;
            }
            const dbo = {
                key: rw.key,
                langs: []
            };
            this.languages.forEach(l=>{
                if(rw[l]) {
                    dbo.langs.push({
                        lang: l,
                        value: rw[l]
                    });
                }
            });
            dbo.meta = this.meta[rw.key] || {};
            axios.post('/admin/text/update/'+dbo.key, {data: dbo}).then(
                rs=>{
                    if(rs.data && rs.data.ok) {
                        this.$message({ message: 'Change saved ', type: 'success' });
                    } else {
                        this.$message.error( 'Server error: ' + rs.data?(rs.data.msg||'?'):'??' );
                    }
                },
                err=>{
                    this.$message.error( 'Server error: ' + err );
                }
            );
        },
        cancelItemEdit: function(){
            this.editPosition = {key:'', lang:''};
        },
        addRow: function(){
            let r = {
                key: '',
                desc: '',
                isnew: true
            };
            this.locales.forEach(l=>{
                r[l] = '';
            });
            this.editRow = r;
        },
        doRowEdit: function(mo){
            let r = {
                _orig: mo,
                key: mo.key,
                desc: this.meta[mo.key]?(this.meta[mo.key].description||''):''
            };
            this.locales.forEach(l=>{
                r[l] = mo[l];
            });
            this.editRow = r;
        },
        dblclk: function(row){
            this.doRowEdit( row );
        },
        deleteRow: function( mo ) {
            let p = this.tabledata.indexOf( mo );
            if( p>=0 ) {
                let m = 'Are you sure you want to delete key: "'+mo.key+'" ?';
                this.$confirm( m, 'Warning', {
                  confirmButtonText: 'Yes',
                  cancelButtonText: 'No',
                  type: 'warning'
                }).then( () => {
                    this.tabledata.splice( p, 1 );
                    axios.get('/admin/text/delete/'+mo.key).then(
                        r=>{
                            if(r.data && r.data.ok) {
                                this.$message({ message: 'Item deleted', type: 'success' });
                            } else {
                                this.$message.error( 'Server error: ' + r.data.msg || '' );
                            }
                        },
                        err=>{
                            this.$message.error( 'Server error: ' + err );
                        }
                    );
                }).catch( ()=>{} );
            }
        },
        saveRowEdit: function(){
            let mo = this.editRow._orig || {};
            let r = this.editRow;
            this.locales.forEach(l=>{
                mo[l] = r[l];
            });

            const dbobj = {
                key: r.key,
                langs: [],
                meta: {}
            };
            this.languages.forEach( l=>{
                if(r[l]){
                    dbobj.langs.push({lang:l, value: r[l]});
                }
            });

            if(mo.key && mo.key!=r.key){
                dbobj.meta = this.meta[mo.key] || {};
            } else {
                dbobj.meta = this.meta[r.key] || {};
            }
            dbobj.meta.description = r.desc; 
            axios.post('/admin/text/update/'+mo.key, {data: dbobj}).then(
                rs=>{
                    if(rs.data && rs.data.ok) {
                        this.$message({ message: 'Item saved', type: 'success' });
                        if(mo.key && mo.key!=r.key){
                            delete this.meta[mo.key];
                        }
                        mo.key = r.key;
                        this.meta[r.key] = dbobj.meta;
                        if(r.isnew){
                            this.tabledata.push( mo );
                        }
                        this.editRow=false;
                    } else {
                        this.$message.error( 'Error saving: ' + rs.data.msg || '' );
                    }
                },
                err=>{
                    this.$message.error( 'Server error: ' + err );
                }
            );
            
        },
        showImpExp: function(isimp) {
            this.doimpexp = true;
            this.imp = isimp;
            this.impexp = isimp?'Import':'Export';
            if(!isimp){
                this.iedata = [];
                this.tabledata.forEach( itm=>{
                    let o = {key:'', langs:[]};
                    o.key = itm.key;
                    Object.keys(itm).forEach( k=>{
                        if(k!='key') {
                            o.langs.push({
                                lang: k,
                                value: itm[k]
                            });
                        }
                    });
                    o.meta = this.meta[o.key] || {};
                    this.iedata.push(o);
                });
                this.iedata = JSON.stringify( this.iedata, null, '    ' );
            } else {
                // Import
                this.iedata = '';
            }
        },
        setTexts: function( newtexts){
            this.dbtexts = newtexts;
            this.languages = null;
            this.matrix = null;
        },
        doImport: function(){
            this.imp = this.exp = false;
            this.doimpexp = false;
            this.iedata = this.iedata || '[]';
            try {
                let ieobj = JSON.parse( this.iedata );
                if(!ieobj.length) {
                    this.$message.error( 'Nothing to import ' );
                } else {
                    axios.post('/admin/import', {texts: ''+this.iedata }).then(r=>{
                        if( r.data && r.data.ok ) {
                            axios.get('/admin/texts').then(
                                rsp=>{
                                    if(rsp && rsp.data) {
                                        this.setTexts( rsp.data.texts );
                                        this.$message({
                                            message: 'Imported',
                                            type: 'success'
                                        });
                                    } else {
                                        this.$message.error( 'Server: ' + r.data.msg );
                                    }
                                },
                                err=>{
                                    this.$message.error( 'Server conn error: ' + err );
                                }
                            );
                        } else {
                            this.$message.error( 'Server: ' + r.data.msg );
                        }
                    });
                }
            } catch( e ) {
                this.$message.error( 'Problem with import: ' + e );
            }
        }
    },
    data: function(){
        return {
            languages: null,
            matrix: null,
            editPosition: {key:'', lang:''},
            editRow: false,
            meta: {},
            filter: '',
            impexp: '',
            doimpexp: false,
            imp: false,
            iedata: '',
            dbtexts: null,
            parallel: false
        };
    }
};

</script>

<style scoped>

.btns {
    display: flex;
}

.btns > span {
    flex-grow: 1;
}

.btns .rbtns button {
    float: right;
}

.impexp {
    width: 100%;
    min-height: 250px;
}
    
</style>
