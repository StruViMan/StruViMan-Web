
let db;
let debug = true;

let main;

const lstnrs = [];
let lq = [];
let lto;

function Logger(name, parent){
    this.name = name || '';

    function logit(l, level, args ){
        let ts = (new Date()).getTime();
        let lv = level || 'log';
        let arr = args || [];
        let pth = l.path();
        let dbobj = {
                time: ts,
                path: pth,
                level: lv,
                msg: arr.join('\t'),
                args: arr
            };
        lq.push(dbobj);
        if(db) {
            db.create(dbobj).then();
        }
        if(debug) {
            console.log( ts, pth, lv, ...arr);
        }
        if(lto) {
            clearTimeout( lto );
        }
        lto = setTimeout(()=>{
            let q = lq;
            lq = [];
            lstnrs.forEach( lstnr=>{
                q.forEach( dbo=>{
                    lstnr(dbo);
                });
            });
        }, 300 );
    }
    
    let prnt = parent;
    if(!prnt && main) {
        prnt = main;
    }
    this.parent = prnt;

    const _lg = this;
    ['log', 'debug', 'warn', 'error', 'info'].forEach( ll=>{
        _lg[ll] = function(...args){
            logit(_lg, ll, args );
        };
    });
    
    this.path = function(){
        if(this._p){
            return this._p;
        }
        this._p = this.name;
        let pn = this.parent;
        while( pn ) {
            if(pn.name) {
                this._p = pn.name + '.' + this._p;
            }
            pn = pn.parent;
        }
        return this._p;
    };
    
    this.connectDB = function(dbstore){
        if(!db){
            db = dbstore;
        }
    };
    
    this.create = function(sectionName) {
        const sn = sectionName.trim();
        if(sn) {
            return new Logger(sn, this);
        }
    };
    
    this.section = this.create;
    
    this.debug = function(dbg){
        debug = dbg;
    }
    
    this.listen = function( listener ){
        lstnrs.push( listener );
    }
    
}

main = new Logger();

module.exports = main;
