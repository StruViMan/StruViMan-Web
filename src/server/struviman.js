const xmlparser = require('./xmlparser');
const convert = require('xml-js');
const fetchUrl = require('fetch').fetchUrl;

const config = require('./config');

function loadRemoteXML( requesturl ){
    let url = requesturl;
    if(url.substr(0,2)=='./'){
        url = 'http://localhost:'+config.port + url.substr(1);
    }
    return new Promise( (resolve, reject)=>{
        fetchUrl(url, (error, meta, body)=>{
            if(error){
                reject({
                    code: -1,
                    message: ''+error
                });
            } else if(meta.status!=200){
                reject({
                    code: meta.status,
                    message: body
                });
            } else {
                resolve( ''+body );
            }
        });
    } );
}

function parseXML(xml){
    let json;
/*
    let json = convert.xml2json(xml, {compact: true, spaces: 4});
    json.errors = json.errors || [];
*/
    try{
        json = xmlparser.parse( xml ); //JSON.parse(json) );
    } catch(e) {
        json = json || {};
        if(typeof json == "string"){
            json={};
        }
        json.errors = json.errors || [];
        json.errors.push( e );
        console.error('parseXML:');
        console.error(e);
    }
    return json;
}

const _manus = {};
const _errs = {};

function completeRequest(req, res, err, json){
    _manus[req.session.id] = json;
    _errs[req.session.id] = err;
    if(err) {
        res.status(err.code||404).send( ""+(err.message || "") );
    } else {
        res.redirect('/struviman.html');
    }
}

function init(app){

    app.get('/', (req, res)=>{
        res.redirect('/struviman.html');
    })

    app.get('/viewmanuscript', (req, res)=>{
        if(req.query.url){
            loadRemoteXML(req.query.url).then(
                xml=>{
                    completeRequest(req, res, null, parseXML(xml));
                },
                err=>{
                    completeRequest(req, res, err );
                }
            ).catch(err=>{
                console.error( err );
                res.status(500).send( ""+err );
            });
        } else {
            completeRequest(req, res );
        }
    });

    app.get('/api/view/:provider/:id', (req, res)=>{
        const p = config.providers[req.params.provider];
        if(p){
            let xmlurl = p.url.replace('{id}', req.params.id);
            loadRemoteXML(xmlurl).then(
                xml=>{
                    completeRequest(req, res, null, parseXML(xml));
                },
                err=>{
                    completeRequest(req, res, err );
                }
            ).catch(err=>{
                console.error( err );
                res.status(500).send( ""+err );
            });
        } else {
            res.status(404).send( "Not found" );
        }
    });

    let showParallel = false;

    app.get('/api/parallel', (req,res)=>{
        res.json( {parallel:showParallel} );
    });

    app.get('/api/setparallel/:vl', (req,res)=>{
        let v = req.params.vl;
        if(v==1) {
            showParallel = true;
        } else if(v==0) {
            showParallel = false;
        }
        res.json({ok:true});
    });

    app.get('/startjs', (req,res)=>{
        let err = _errs[req.session.id];
        let json = _manus[req.session.id];

        err = err?JSON.stringify(err):'null';
        json = err + (json?', '+JSON.stringify(json):'');
        let javascript = 'window._showParallel='+showParallel+'; window._init( "'+req.session.id+'", '+json+' );';
        res.set('Content-Type', 'application/javascript');
        delete _manus[req.session.id];
        delete _errs[req.session.id];
        res.send( javascript );
    });

}

module.exports = init;

