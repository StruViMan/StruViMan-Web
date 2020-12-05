const fs = require('fs');
const path = require('path');

let multilang_file = path.join( __dirname, 'multilanguage.json');
let multilang_save_file = path.join( process.cwd(), 'multilanguage.saved.json');
console.log('multilang_file', multilang_file );
let texts = require( multilang_file );
if(fs.existsSync(multilang_save_file)){
    texts = require( multilang_save_file );
}

module.exports = texts;
