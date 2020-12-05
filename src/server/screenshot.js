const config = require('./config');

var bodyParser = require('body-parser');
//var multer = require('multer'); // v1.0.5
//var upload = multer(); // for parsing multipart/form-data

const svg2img = require('node-svg2img');

const Datauri = require('datauri');
const datauri = new Datauri();

function init(app){

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    
    app.post('/screenshot', (req, res)=>{
        let svgString = req.body.svg;
console.log('svg', svgString )
        svg2img(svgString, function(error, buffer) {
            //returns a Buffer 
            datauri.format('.png', buffer);
            res.set('Content-Type', datauri.mimetype );
            res.send( datauri.content );
//            fs.writeFileSync('foo1.png', buffer);
        });
    } );

}

module.exports = init;

