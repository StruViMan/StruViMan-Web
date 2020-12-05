
const storeKey = 'StruViManColors';

let store = window.localStorage;

// Colours for CUs
//In Worten: [Yellow2,Dodgerblue,Magenta,Chartreuse,Firebrick,DarkViolet,OliveDrab,Chocolate]
const cuCols = ["#EEEE00","#1E90FF","#FF00FF","#7FFF00","#B22222","#9400D3","#6B8E23","#D2691E"];
// converted using https://www.webfx.com/web-design/hex-to-rgb/
const cuColsRGB = [
    [238,238,0],
    [30,144,255],
    [255,0,255],
    [127,255,0],
    [178,34,34],
    [148,0,211],
    [107,142,35],
    [210,105,30],
] //Müsste hier nicht ein Strichpunkt hin? 

// Colours for segments
//In Worten: [SpringGreen,Aquamarine,Gold,MediumOrchid1,DarkOliveGreen2,Salmon];
const segCols = ["#00FF7F","#7FFFD4","#FFD700","#E066FF","#BCEE68","#FA8072"];
const colors = {
    'cu': cuCols,
    'segment': segCols
};

// Fixed colours for segments.
const fixedSegmentColors = [ 
    {name:"Testamentum nouum", colour:"#CCCCCC"}, //grey
    {name:"Prologi librorum biblicorum", colour:"#00FF00"}, //green
    {name:"Eusebiana", colour:"#FFA500"}, //orange
    {name:"Capitula librorum biblicorum", colour:"#FFFF00"}, //yellow
    {name:"Versus et Epigrammata", colour:"#0000FF"}, //blue
    {name:"Subscriptiones librorum biblicorum", colour:"#A020F0"}, //purple
    {name:"Catenae", colour:"#FF1493"}, //deepPink
    {name:"Imagines", colour:"#000000"}, //black
    {name:"Liturgica", colour:"#FF0000"}, //red
    {name:"Annotationes", colour:"#028d16"}, //middlegreen
];


let colorConfig;

const version = '2.1';

function init( type ){
    if(!colorConfig){
        colorConfig = store.getItem(storeKey);
        if(colorConfig){
            colorConfig = JSON.parse( colorConfig );
            if(colorConfig._version != version){
                colorConfig = null;
            }
        }
    }
    if(!colorConfig){
        colorConfig = {
            '_version': version,
            'cu': {
                colors: [],
                keys: {}
            },
            'segment': {
                colors: [],
                keys: {}
            }
        };
        let newTestament = 'Testamentum nouum'.trim().toLowerCase().replace(/[\s\.]/g, '_');
        colorConfig['segment'].keys[newTestament]='#ccc';
        refillColors( 'cu' );
        refillColors( 'segment' );
        saveConfig();

        fixedSegmentColors.forEach( sc => {
            let cname = sc.name.trim().toLowerCase().replace(/[\s\.]/g, '_');
            colorConfig['segment'].keys[cname] = sc.colour;
        });
        refillColors( 'cu' );
        refillColors( 'segment' );
        saveConfig();
    }
    if(!colorConfig[type]){
        colorConfig[type] = {
            colors: [],
            keys: {}
        }
        refillColors( type );
    }
    return colorConfig[type];
}

function refillColors( type ){
    colors[type].forEach(c=>{
        colorConfig[type].colors.push(c);
    });
}

let saveTimeout;
function saveConfig(){
    if(saveTimeout){
        clearTimeout( saveTimeout );
    }
    saveTimeout = setTimeout(()=>{
        store.setItem(storeKey, JSON.stringify(colorConfig) );
        saveTimeout = null;
    }, 100);
}

function nextColor( type ){
    let c = init(type);
    c = c.colors.shift();
    if(colorConfig[type].colors.length<1){
        refillColors( type );
    }
//    saveConfig();
    return c;
};

const colarr = '0123456789abcdefghijklmnopqrstuvwxyzäüö'
const colratio = 255/colarr.length

function getColor(key, type){
    if (key=='filler') {
        return "rgb(255, 255, 255)"
    }
    let k = key.trim().toLowerCase().replace(/[\s\.]/g, '_');
    let ret = init( type );
    ret = ret.keys[k];
    if(!ret){
        if(type=='cu') {
            let ca = key.trim().split('.')
            let col = cuColsRGB[ Number(ca[0]) & cuColsRGB.length ]
if (!col) {
    console.log('col not found', key, ca)
    col = cuColsRGB[ cuColsRGB.length-1 ]
}            
            let nval = colratio * (colarr.indexOf( (ca[1]||'a').toLowerCase().charAt(0))+1 )
            ret = 'rgb('+col[0]+', '+col[1]+', '+ Math.round(nval) +')'
        }
        ret = nextColor( type ); 
        colorConfig[type].keys[k] = ret;
        saveConfig();
    }
    return ret;
}

export default {
    get: getColor
};
