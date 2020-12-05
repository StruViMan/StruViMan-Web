const fs = require('fs');
const path = require('path');

let xml_files=[];

let testFileDir = path.join( __dirname, '..', '..', 'test',  'data' );
let files = fs.readdirSync( testFileDir );

let xmlid=1;
files.forEach( fn=>{
    if(fn.match(/\.xml$/i)){
        xml_files.push({
            id: xmlid++,
            name: fn,
            path: path.join( testFileDir, fn )
//            ,xml: '' + fs.readFileSync( path.join( testFileDir, fn ) )
        });
    }
} );

const javascript = 'window._init('+JSON.stringify(xml_files)+');';

let sampleFileDir = path.join( __dirname, '..', '..', 'test', 'samples' );
files = fs.readdirSync( sampleFileDir );
let sample_xml_files=[];
xmlid=1;
files.forEach( fn=>{
    if(fn.match(/\.xml$/i)){
        sample_xml_files.push({
            id: xmlid++,
            name: fn,
            path: path.join( sampleFileDir, fn )
//            ,xml: '' + fs.readFileSync( path.join( sampleFileDir, fn ) )
        });
    }
} );
const samplejs = 'window._init('+JSON.stringify(sample_xml_files)+');';


function init( app ){
    
    app.get('/testfiles', (req, res)=>{
        res.set('Content-Type', 'application/javascript');
        res.send( javascript );
    });
    
    app.get('/samplefiles', (req, res)=>{
        res.set('Content-Type', 'application/javascript');
        res.send( samplejs );
    });

    app.get('/testxml/:filename', (req,res)=>{
        let fn = req.params.filename;
console.log('fn', fn);
        let f = xml_files.filter(x=>{
            return x.id==fn; 
        });
        if(f.length){
            res.send( fs.readFileSync( f[0].path ) );
        }
    });

    app.get('/samplexml/:filename', (req,res)=>{
        let fn = req.params.filename;
console.log('fn', fn); 
        let f = sample_xml_files.filter(x=>{
            return x.id==fn;
        });
        if(f.length){
            res.send( fs.readFileSync( f[0].path ) );
        }
    });
    
};

module.exports = init;
