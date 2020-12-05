const fs = require('fs');
const path = require('path');

const L = require('./logger').section('admin');

const config = require('./config');
const adminPass = config.adminPass || 'StruViMan222';

let multilang_file = path.join( __dirname, '../../multilanguage.json');
let multilang_save_file = path.join( __dirname, '../../multilanguage.saved.json');
let texts = require( multilang_file );
if(fs.existsSync(multilang_save_file)){
    texts = require( multilang_save_file );
} else {
    fs.writeFile( multilang_save_file, JSON.stringify(texts) );
}

let javascript = 'window._init('+JSON.stringify( texts )+');';


// Helper function to get the keys for an object.
function keysForObject(obj, parentStr, keyStore){
    let ret = keyStore || {};
    let ps = parentStr || '';
    let ks;
    Object.keys(obj).forEach( k=>{
        let v = obj[k];
        ks = ps.length?ps+'.'+k : k;
//console.log('k4o', ks, k, typeof v);
        if(typeof v == 'object'){
            keysForObject( v, ks, ret);
        } else {
            ret[ks] = v;
        }
    });
    return ret;
}

// Checks to see if session is admin(logged in). 
// If not error is sent.
function validAdminSession(req, res, msg){
    if(!req.session.isadmin) {
        L.info('invalid admin session');
        res.send({ok:false, msg: msg||'No permission.'});
        return false;
    }
    return true;
}

function init( app ){

    const store = app._stores.I18n;
    
    function textsFromDB( cb ){
        var ret = { meta:{} };
        
        function getobj(ky, lang){
            let r = {};
            let o = ret[lang] = ret[lang] || {};
            let arr = ky.split('.');
            r.val = arr.pop();
            arr.forEach( p=>{
                o = o[p] = o[p] || {};
            });
            r.obj = o;
            return r;
        }
        
        store.find().then( 
            res => {
                if(res && res.length){
                    res.forEach( r=>{
                        let ls = r.langs || ['en'];
                        ls.forEach( l=>{
                            let obj = getobj( r.key, l.lang );
                            obj.obj[obj.val] = l.value;
                        });
                        ret.meta[r.key] = r.meta;
                    });
                }
                if( cb ){
                    cb( ret );
                }
            }
        );
    }
    
    // Empties the db collection and copies the texts object to the database
    function dbFromTexts( cb ){
        const langs = [];
        var kys = {};
        Object.keys( texts ).forEach( k=>{
            if(k!='meta'){
                langs.push( k );
            }
        });
        langs.forEach( l=>{
            let ks = {};
            keysForObject(texts[l], '', ks);
            Object.keys( ks ).forEach( lk=>{
                kys[lk] = kys[lk] || { key:lk, langs: [] };
                kys[lk].langs.push({
                    lang: l,
                    value: ks[lk]
                });
            });
        });
        const dbrows = [];
        Object.keys( kys ).forEach( k=>{
            const o = kys[k];
            o.meta = texts.meta[k] || {};
            dbrows.push( o );
        });
L.log('Saving rows to db:', dbrows.length );
        const prms = [];
        prms.push( store.destroy({}) );
        prms.push( store.createEach(dbrows) );
        Promise.all( prms ).then(
            r=>{
L.log('Updated database', r );
            },
            e=>{
                console.log('dbFromTexts Error', ''+e);
            }
        );
    };
    
    app.get('/admin/init', (req, res)=>{
        res.set('Content-Type', 'application/javascript');
        textsFromDB( ts=>{
            L.debug('init', ts );
            if(ts && ts.en) {
                javascript = 'window._init('+JSON.stringify( ts )+');';
            } else {
                dbFromTexts();
            }
            res.send( javascript );
        });
    });
    
    app.get('/admin/texts', (req, res)=>{
        textsFromDB( ts=>{
            let txts = texts;
            if(ts && ts.en) {
                txts = ts;
            } else {
                dbFromTexts();
            }
            L.debug('txts', txts );
            res.send( {texts: txts } );
        });
    });
    
    app.get('/admin/isadmin', (req, res)=>{
        if(req.session.isadmin) {
            res.send({ok:true});
        } else {
            res.send({ok:false});
        }
    });
    
    app.post('/admin/login', (req, res)=>{
        if(adminPass==req.body.p){
            req.session.isadmin = true;
            return res.send({ok:true});
        }
        res.send({ok:false});
    });

    app.post('/admin/import', (req,res)=>{
        if( !validAdminSession(req, res) ) {
            return;
        }
        if (!req.body) return res.sendStatus(400);
        if(!req.body.texts) {
            return res.send({ok:false, msg:'No texts sent.'});
        }
        let itexts = JSON.parse( req.body.texts );

        let prms = [];

        store.destroy({}).then(
            dr=>{
                store.createEach( itexts ).fetch().then(
                    fr=>{
                        res.send({ok:true});
                    },
                    fe=>{
                        res.send({ok:false, msg:'Import Error: ' + err});
                    }
                );
            },
            de=>{
                res.send({ok:false, msg:'Import Error: ' + e});
            }
        );
    });
    
    app.get('/admin/text/delete/:key', (req, res)=>{
        if( !validAdminSession(req, res) ) {
            return;
        }
        if(!req.params.key) {
            return res.send({ok:false, msg:'No key sent.'});
        }
        store.destroy({key:req.params.key}).then(
            rs =>{
                res.send({ok:true});
            },
            e =>{
                res.send({ok:false, msg:'Delete Error: ['+req.params.key+'] ' + e});
            }
        );
    });
    
    app.post('/admin/text/update/:key', (req, res)=>{
        if( !validAdminSession(req, res) ) {
            return;
        }
        if(!req.params.key) {
            return res.send({ok:false, msg:'No key sent.'});
        }
        if (!req.body) return res.sendStatus(400);
        if(!req.body.data) {
            return res.send({ok:false, msg:'No data sent.'});
        }
        let isnew = req.params.key=='undefined' || req.params.key==undefined;
        // Delete old entry if key has changed
        if( !isnew && req.body.data.key != req.params.key) {
            store.destroy({key:req.params.key}).then();
            isnew = true;
        }
        const upd = ()=>{
            store.findOrCreate({key:req.body.data.key}, req.body.data ).then(
                rs =>{
                    if(rs) {
                        store.update( {key:req.body.data.key}, req.body.data ).then(
                            r2=>{
                                res.send({ok:true});
                            },
                            e2=>{
                                res.send({ok:false, msg:'Update Error(2): ['+req.params.key+'] ' + e});
                            }
                        );
                    } else {
                        res.send({ok:true});
                    }
                },
                e =>{
                    res.send({ok:false, msg:'Update Error: ['+req.params.key+'] ' + e});
                }
            );
        };
        if( isnew ) {
            store.findOne({key:req.body.data.key}).then(
                fr=>{
                    if(fr) {
                        res.send({ok:false, msg:'Key exists: ['+req.body.data.key+'] '});
                    } else {
                        upd();
                    }
                },
                e=>{
                    res.send({ok:false, msg:'Update Error: ['+req.params.key+'] ' + e});
                }
            );
        } else {
            upd();
        }
    });
    
};

module.exports = init;
