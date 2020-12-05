const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();

const session = require('express-session');
var bodyParser = require('body-parser');

const cfg = require('./config');
const debug = cfg.debug || false;

const WL = require('./db/waterlineinit');
const wl = new WL(cfg);
const StoreClass = require('./db/waterlineExpressStore')(session);
let store;

const L = require('./logger').section('server');

wl.init().then(
    wtrl => {
L.log('wl', ...Object.keys(wl) );
        store = new StoreClass( wl.Session );
        let sessionDefaults = {
            secret: 'StruViMan_dev',
            store: store,
            cookie: {}
        };
        app.use( session(sessionDefaults) );

        app._stores = wl;
        
        if(cfg.allowTest){
            L.debug( true );
        }
//        L.connectDB( wl.Logs );
        L.info('started');
        
        start();
    }
);

function start(){
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
    // parse application/json
    app.use(bodyParser.json({ limit: '50mb' }))

    if(debug) {
        app.use('*', (req, res, next )=>{
            console.log( req.method, req.originalUrl );
            next();
        });
    }

    require('./struviman')( app );
    
    require('./admin')( app );

    const screenshotPath = path.resolve( path.join( __dirname, '..', '..', 'public/static/screenshots') );
    if ( !fs.existsSync(screenshotPath) ) {
        fs.mkdirSync( screenshotPath );
    }
    let nextssid=1;
    let screenshots=[];
    const ssvalidity = 1000*60*60; // 1 hour
    let sstimeout;
    function clearScreenshots(){
        if( sstimeout ){
            clearTimeout( sstimeout );
        }
        sstimeout = setTimeout(function(){ 
            var nss=[].concat(screenshots);
            screenshots=[];
            const nw = Date.now();
            nss.forEach( ss=>{
                if(nw-ss.time>=ssvalidity){
                    fs.unlinkSync( ss.path );
                } else {
                    screenshots.push(ss);
                }
            });
            clearScreenshots(); 
        }, 1000*60);
    }

const svg2img = require('svg2img');

    app.post('/api/ss', (req, res) => {
        if(req.body.b){
            while( fs.existsSync( path.join(screenshotPath, 'img'+nextssid+'.jpg' ) ) ) {
                nextssid++; 
            }
            const imgNme = 'img'+nextssid;
            const filepath = path.join(screenshotPath, imgNme+'.jpg');

            //font-size="16"
            let svg = req.body.b.replace(/\&nbsp\;/g, ' ')
            if (cfg.svgrepl) {
                cfg.svgrepl.forEach( r =>{
                    svg = svg.replace( new RegExp(r.regex, 'gi'), r.repl )
                })
            }

            svg2img(svg, function(error, buffer) {
                //returns a Buffer
                fs.writeFileSync(filepath, buffer);
            });

            screenshots.push({
                time: Date.now(),
                path: filepath
            });
            if( !sstimeout ){
                clearScreenshots();
            }
            res.send({file:imgNme+'.jpg'});

        }
    });
    
    if(cfg.allowTest) {
        require('./testpage')( app );
        app.use( express.static( path.resolve( path.join( __dirname,  './../../', 'public') ) ) );
        // Temp for dev only
        app.use('*', function(req,res){
            res.redirect('/sample.html');
        });
    } else {
        app.get('/test.html*', (req, res)=>{
            res.status(404).send('Not Found !!');
        })
        app.use( express.static( path.resolve( path.join( __dirname,  './../../', 'public') ) ) );
    }
}

module.exports = app; 

