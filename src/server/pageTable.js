const _folioParser = require('./folioparser');
const decToRoman = _folioParser.decToRoman;
const romanToDec = _folioParser.romanToDec;


function PageTable(){
    const pages = {};
    const order = [];
    let ranges = [];

    const addPage = (p)=>{
        let pk = p.original + p.vr;
        let orig = pages[pk];
        if(!orig){
            pages[pk] = p;
            if(p.fake){
                p._index = order.length;
            }
            order.push(p);
        } else {
            // Replace generated with original
            if(orig.fake && !p.fake){
                order[orig._index] = p;
                p.range = orig.range;
                pages[pk] = p;
            }
        }
    };

    // Generate the next page after the supplied page
    const nextPage = (p)=>{
        const ret = {
            val: p.val+1,
            original: p.original,
            type: p.type,
            vr: p.vr,
            fake: true
        };
        
        if(ret.vr.toLowerCase()=='r'){
            ret.vr = 'v'
            // If it's the front of a folio, just retrun the back
//console.log('nxt', JSON.stringify(ret) );
//console.log('nxt', '('+ret.val+')', p.original+(p.vr?p.vr:''), '=>', ret.original+(ret.vr?ret.vr:'') );
            return ret;
        }
        if(ret.vr.toLowerCase()=='v'){
            ret.vr = 'r'
        }

        // Work out if original is uppercase;
        let ucase = p.original[0];
        ucase = (ucase === ucase.toUpperCase() );

        let n = p.original;
        if(ret.type == 'r'){
            n = romanToDec( n.toUpperCase() );
            n = n+1;
            n = decToRoman( n );
            if(!ucase) n = n.toLowerCase();
        }
        else if(ret.type == 'a') {
            n = n.toUpperCase().charCodeAt(0);
            n = String.fromCharCode( n+1 );
            if(!ucase) n = n.toLowerCase();
        }
        else if(ret.type == 'd') {
            n = Number(n);
            n = '' + (n+1);
        }
        ret.original = n;
//console.log('nxt', '('+ret.val+')', p.original+(p.vr?p.vr:''), '=>', ret.original+(ret.vr?ret.vr:'') );

        return ret;
    };

    let rnum = 0;
    this.addRange = (p1, p2)=>{
        if(!p1 && !p2) return;
        rnum++;
        if(p1){
            p1.range = rnum;
//console.log('p1', JSON.stringify(p1) );
            addPage(p1);
        }
        if(p2){
            p2.range = rnum;
            if(!p1){
                addPage(p2);
                return;
            }
//console.log('p2', p2.val - (p1?p1.val:0), JSON.stringify(p2||"") );
            let i = p2.val - p1.val;
//console.log('## Add range', (p1?p1.val:0), p2.val, '=', i)
            let p = nextPage(p1);
            while(i>1 && !(p.original==p2.original && p.vr==p2.vr)){
                p.range = rnum;
//console.log('p', i, JSON.stringify(p) );
                addPage(p);
                p = nextPage(p);
                i--;
            }
//console.log('p2', JSON.stringify(p2) );
            addPage(p2);
        }
    };

    let newRange = ()=>{
        let ret = {
            num: 1,
            min: 99999999,
            max: 0,
            count: 0,
            length: 0,
            offset: 0,
            items: []
        };
        ranges.push(ret);
        return ret;
    };

    let buildRanges = ()=>{
        ranges = [];
        let r;
        let finr = ()=>{
            if(!r) return;
            r.length = r.max - r.min;
        };
        order.forEach(p=>{
            if(!r || p.range!=r.num){
                finr();
                r = newRange();
                r.num = p.range;
            }
            r.items.push( p );
            r.min = Math.min(r.min, p.val);
            r.max = Math.max(r.max, p.val);
            r.count++;
        });
        finr();
        // Calculate the gaps between the ranges;
        let lastr;
        ranges.forEach(r=>{
            if(lastr){
                if(r.min>lastr.max){
                    r.offset = r.min - lastr.max - 1;
                }
            }
            lastr = r;
        });
    };

    let sort = ()=>{
        const _pn = (p) => {
            let ret
            if( p.oldval!=undefined ) ret = p.oldval;
            else ret = p.val;
            return Number(ret)
        };
        let changed=true;
        while(changed) {
            changed=false;
            for(let i=order.length-1; i>0 && !changed; i--){
                let p1 = order[i];
                let p1v = _pn(p1);
                // Only sort decimals that are not fakes.
//                if(p1.type=='d' && !p1.fake) {
                if(p1.type=='d' ) {
                    let newpos;
                    for(let j=0; j<i && newpos==undefined; j++){
                        let p2 = order[j];
                        let p2v = _pn(p2);
//                        if(p2.type==p1.type && !p2.fake && p1v<p2v){
                        if(p2.type==p1.type && p1v<p2v){
                            newpos = j;
                        }
                    }
                    if(newpos!=undefined) {
                        order.splice(i, 1);
                        order.splice(newpos,0, p1);
                        changed=true;
                    }
                }
            }
        }
        let nm=1;
        order.forEach( p=>{
            if(p.oldval==undefined){
                p.oldval = Number(p.val);
            }
            p.val = nm++;
        });
    };

    let renumber = ()=>{
        let pn = 1;
        ranges.forEach( r => {
            pn = pn + r.offset;
            r.items.forEach( p => {
                if(p.oldval==undefined){
                    p.oldval = p.val;
                }
                p.val = pn++;
            });
        });
    };

    this.lookup = (pg) => {
        let ky = pg.original + pg.vr;
        let p = pages[ky];
        if(p) {
            return p.val;
        }
    };

    this.done = () => {
/*
        buildRanges();
        renumber();
        return ranges;
*/
        sort();
    };

    this.dump = ()=>{
        let ret = order.map((p,i)=>{
            let o = {i:i, original: p.original, vr:p.vr};
            return p.range +'  ' + p.type + ' ' + p.val +'('+ (p.oldval?p.oldval:'') +')' + ' '+ p.original+p.vr +'    '+ (p.fake?'':'X');
        });
        ret = ret.concat(ranges.map(r=>{
            return 'r:'+ r.num +'   '+ r.min +'=>'+ r.max +'    '+ r.offset;
        }));
        return ret;
    };
}

module.exports = PageTable;
