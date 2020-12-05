const fs = require('fs');
const path = require('path');

let cfgFile = path.join( __dirname, '../../config.json' );

let cfg = {
    port: 8080,
    waterline: {}
};
let _cfg;

if( fs.existsSync( cfgFile) ){
    _cfg = require( cfgFile );
    Object.keys(_cfg).forEach( k=>{
        cfg[k] = _cfg[k];
    } );
}

module.exports = cfg;
