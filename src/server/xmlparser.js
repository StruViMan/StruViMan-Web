
// https://cheerio.js.org/
const cheerio = require('cheerio');
const extend = require("extend");

const PageTable = require('./pageTable');

const _folioParser = require('./folioparser').parser;
const folioparser = (...ags)=>{
    let rt = _folioParser(...ags);
//console.log(ags, '=>', rt);
    return rt;    
};
const xmlstr = require('./folioparser').xmlstr;

const L = require('./logger').section('xmlparser');

// Helper function to clean up json.
// - replace 'p:' in keynames
// - replace each '_text' object with a string.
let parse = (k, v)=>{
    let ret;
    if(k instanceof Array){
        ret = [];
        k.forEach( o=>{
            ret.push( parse(o) );
        });
    }
    else if(k instanceof String){
        ret = k;
    }
    else if(k instanceof Object){
        ret = {};
        let kys = Object.keys( k );
        if(kys.length == 1 && kys[0]=='_text'){
            ret = k[kys[0]];
        } else {
            kys.forEach( ky=>{
                let nky = ky.replace('p:', '');
                ret[nky] = parse( k[ky] );
            });
        }
    } else {
        ret = k;
    }
    return ret;
};

function getChildJSON($, el){
    let ret = {};
    el.children().each((i,e)=>{
//console.log( e.tagName, '=', $(e).text() );
        ret[e.tagName] = $(e).text();
    });
    return ret;
}

const copts = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
};

// Parse JSON created by xml-js to create a "nicer" object
// and create the sections needed for displaying.
function Parser(){
    this.parse = function(xmlDoc){
        let pid=1;
        let json = {};
        let inhaltCount = 0;
        json.errors=[];
        let tosort = []; // Array of items which will be sorted
        json.first = 999999; // Last page number
        json.last = 0; // First page number
        json.itemcount = 0;

        let cuid = 1;
        const cus = [];
        let itmid = 1;
        let items = [];

        let cubyid = (id)=>{
            let ret;
            for(let i=0; i<cus.length && !ret; i++){
                ret = cus[i];
                if(ret.id != id){
                    ret = null;
                }
            }
            return ret;
        };

        let xml = (""+xmlDoc).replace( /p\:/gi, '' );

        let $ = cheerio.load(xml, copts);

        // Get Manu Meta
        json.meta = getChildJSON($, $('manuskriptType > meta') );
        json.meta.manuLink = json.meta.manuLink.replace(/.+?\/\/(.*)/i, 'http://$1');

        let PT = new PageTable();

        const parseFolio = (f, addToTable)=>{
            let rt = _folioParser(f);
            if(addToTable){
                rt.forEach(r=>{
                    let pm = (po)=>{ return po?po.pageMeta:undefined };
                    PT.addRange( pm(r[0]), pm(r[1]) );
                });
            }
            return rt;
        };

        // Get Sections
        let itempage=1;
        json.sections = [];
        $('cu').each((i,e)=>{
            const sect = {
                id: cuid,
                start: 9999999999,
                end: 0,
                sections: [],
                items: []
            };
            sect._el = e;
//            json.sections.push(sect);
            
            // If the CU is empty, ignore it and its page ranges
            let inhalts = $(e).find('inhalt');
/*
            if(!inhalts.length) {
                return;
            }
*/
            let flio, fp;
            sect.meta = getChildJSON($, $(e).find('cuMeta') );
            sect.colorKey = sect.meta.cuNummer;
            if(sect.meta.cuFolio) {
                flio = $(e).find('cuMeta > cuFolio').text();
                fp = parseFolio(flio, true);
                sect.sections = fp;
            }

            let _pm = p =>{
                if(p && p.pageMeta){
                    return p.pageMeta;
                }
                return undefined
            };

            // Get items
            inhalts.each((i, itmel)=>{
                json.itemcount++;
                const itm = {
                    id: itmid,
                    sectid: cuid
                };
                itm.meta = getChildJSON( $, $(itmel) );

                // Parse folio
                flio = $(itmel).find('inhaltFolio').text();
                fp = parseFolio(flio);
                itm.pages = fp;

                // Testamentum nouum 
//                if( itm.meta.inhaltKategorie.toLowerCase() == 'testamentum nouum') {
//                    itm.ignoreOverlap = true;
//                }
                itm.label = itm.meta.inhaltWerk;
                // Add EA and "pas clair" to label
                const bez = (''+itm.meta.inhaltBezugCU).trim();
                if(bez.toLowerCase() == 'ea' || bez.match(/pas[\s\-]+clair/i)) {
                    itm.label = '[' + itm.meta.inhaltBezugCU.trim() + '] ' + itm.label;
                    itm.isea = true
                }
                if( !itm.meta.inhaltFolio || itm.meta.inhaltFolio.trim().length==0 ) {
                    itm.label = '*** - ' + itm.label;
                    itm.meta.inhaltFolio = '*** - No folios';
                    // If the first section of a cu has no folios but the CU does, then we use the CU folios.
                    if (i==0 && sect.sections) {
                        itm.pages = sect.sections
                    }
                }
                // Add category to end of label
                if(itm.meta.inhaltKategorie) {
                    itm.label = itm.label + ' ('+ itm.meta.inhaltKategorie +')';
                }
                itm.colorKey = itm.meta.inhaltKategorie || itm.meta.inhaltWerk;

                // Generate item for each page set
                itm.pages.forEach( r=>{
                    let nitm = {};
                    Object.keys(itm).forEach(k=>{ nitm[k]=itm[k] });
                    nitm.id = itmid;
                    nitm.pages = r;
                    sect.items.push( nitm );
                    PT.addRange( _pm(r[0]), _pm(r[1]) );
//console.log('\nnitm', nitm, '\n' );
                    itmid++;
                });
            });

            // If section has no items, create a blank item.
            if(sect.items.length==0) {
                // CU has folios
                if (sect.sections){
                    const itm = {
                        id: itmid,
                        sectid: cuid
                    };
                    itm.meta = {
                        inhaltBezugCU: "",
                        inhaltDatum: "",
                        inhaltDetails: "",
                        inhaltFolio: sect.meta.cuFolio,
                        inhaltId: "",
                        inhaltKategorie: "",
                        inhaltKommentar: "",
                        inhaltKopist: "",
                        inhaltNummer: "",
                        inhaltReferenz: "",
                        inhaltWerk: '['+ sect.meta.cuTitel +']', //"?",
                        pages_meta: "",
                    };
                    itm.label = itm.meta.inhaltWerk;
                    itm.colorKey = 'no described witnesses';
                    itm.pages = parseFolio(sect.meta.cuFolio);
//console.log("\n**Empty cu", sect.meta.cuFolio, '\n', itm.pages, '\n\n' )
                    // Generate item for each page set
                    itm.pages.forEach( r=>{
                        let nitm = {};
                        Object.keys(itm).forEach(k=>{ nitm[k]=itm[k] });
                        nitm.id = itmid;
                        nitm.pages = r;
                        sect.items.push( nitm );
                        PT.addRange( _pm(r[0]), _pm(r[1]) );
//console.log('\nnitm', nitm, '\n' );
                        itmid++;
                    });
                }
            }

            cus.push(sect);
            cuid++;
        });

        PT.done();

        cus.forEach( cu=>{
            let itemcount=0;

            cu.items.forEach( itm =>{
                let r = itm.pages;
                let _pval = (p, dflt=0)=>{ 
                    let ret = dflt
                    if(p && p.pageMeta) {
                        ret = PT.lookup( p.pageMeta );
                    } 
//console.log('lookup', itm.meta.inhaltFolio, '('+ p.pageMeta?(p.pageMeta.original + p.pageMeta.vr):'' +')', '=>', ret)
                    return ret; 
                };
                itm.start = _pval(r[0], itempage);
                itm.end = _pval( r[1], itm.start );
                itempage = itm.end + 1;
                items.push( itm );
    itm.meta.pages = itm.id +': '+ itm.start +' - '+ itm.end;
    itm.meta.pages_meta = JSON.stringify(itm.pages);
            });
            delete cu._el;
        });

        // Sort Items into page number order
        items.sort( (a,b)=>{
            if(a.start==b.start){
                if(a.sectid!=b.sectid) {
                    return a.sectid-b.sectid
                }
                if(a.end==b.end){
                    return a.id-b.id;
                }
                return b.end-a.end;
            }
            return a.start-b.start;
        });

        // Find items that have same page range and category to create groups
        /**
         * Iterate through items starting at second.
         * If item has same range etc as previous create/find group by checking grp Id of prev item and add.
         * Also add ignoreOverlap to all groupp elements to make sure they are not treated as parallel content.
         */
        const grps = {}
        let grpId = 1
        items.forEach( (itm, ind) => {
            if (ind==0) {
                return
            }
            const prv = items[ind-1]
            if (prv.start==itm.start 
                    && prv.end==itm.end 
                    && !itm.isea
                    && prv.meta.inhaltKategorie
                    && prv.meta.inhaltKategorie==itm.meta.inhaltKategorie) 
                    {
                let gid = prv.gid
                if (!gid) {
                    gid = grpId++
                    grps[gid] = []
                    grps[gid].push(prv)
                    prv.ignoreOverlap = true
                    prv.gid = gid
                }
                grps[gid].push(itm)
                itm.ignoreOverlap = true
                itm.gid = gid
            }
        })

        // Set attributes for group items
        Object.values(grps).forEach( grp => {
            grp.forEach( (itm, ind) => {
                itm.glen = grp.length
                itm.gpos = ind
            })
        })

        const overlaps = {};
        // Create i2 as overlap of i1
        let createOverlap = (i1, i2)=>{
            if(i2.ignoreOverlap) {
                return;
            }
            // Already overlaped.
            if( i2.overlap ) {
                return;
            }
            // avoid circle
            if(i1.overlapFrom==i2.id){
                return
            }
            i2.overlap = (i1.overlap || 0) + 1;
            i2.overlapFrom = i1.id;
            i2.overlapBase = i1.overlapBase || i1.id;
            overlaps[i1.id] = i1;
            overlaps[i2.id] = i2;
        };

        let scanOverlaps = fnc => {
            for(let i=0; i<items.length-1; i++){
                let i1 = items[i];
                for(let j=items.length-1; j>=0; j--){
                    let i2 = items[j];
                    if(i1.id!=i2.id){
                        fnc( i1, i2);
                    }
                }
            }
        };

        // find overlaps that are completely within a section that can not be an overlap
        scanOverlaps( (i1,i2)=>{
            if(i1.ignoreOverlap && i1.start<=i2.start && i1.end>=i2.end){
                createOverlap( i1, i2 );
//console.log('1', i2.id, i2.start, i2.end, i2.overlap, i2.overlapBase );
            }
        });

        // find overlaps that only start in a section that can not be an overlap
        scanOverlaps( (i1,i2)=>{
            if(i1.ignoreOverlap && i2.start>=i1.start && i2.start<i1.end){
                createOverlap( i1, i2 );
//console.log('2', i2.id, i2.start, i2.end, i2.overlap, i2.overlapBase );
            }
        });

        // find overlaps that are completely within
        scanOverlaps( (i1,i2)=>{
            if(!i1.ignoreOverlap && i1.start<=i2.start && i1.end>=i2.end){
                createOverlap( i1, i2 );
//console.log('3', i2.id, i2.start, i2.end, i2.overlap, i2.overlapBase );
            }
        });

        // find overlaps that only start in a section
        scanOverlaps( (i1,i2)=>{
            if(!i1.ignoreOverlap && i1.start<=i2.start && i2.start<i1.end){
                createOverlap( i1, i2 );
//console.log('4', i2.id, i2.start, i2.end, i2.overlap, i2.overlapBase );
            }
        });

        // Get all overlaps
        let ovs = items.filter( itm=>{
            if(itm.overlap) return true;
            return false;
        });
        // Calculate overlap indents
        let ovcols = [];
        let scancol = (itm, col) => {
            let c = ovcols[col] = ovcols[col] || [];
            let ret = true;
            let r = {start: itm.start, end: itm.end};
            for( let i=0; i<c.length && ret; i++){
                let cr = c[i];
                if(cr.start>=r.start && cr.start<=r.end){
                    ret = false;
                }
                else if(cr.end>=r.start && cr.end<=r.end){
                    ret = false;
                }
            }
            if(ret){
                c.push(r);
            }
            return ret;
        };
        ovs.forEach( ov=>{
            let col = 0;
            let found = false;
            while( !found ){
                found = scancol(ov, col);
                col++;
            }
            ov.overlap = col;
        });
        json.overlaps = ovcols.length;
        ovcols = [];

        // Build sections based on sorted items. i.e. 2 sections can have same meta
        let sct;
        let scts = [];
        let nwsct = (itm)=>{
            const s = cubyid(itm.sectid);
            sct = {};
            extend(true, sct, s);
            sct.items = [];
            scts.push(sct);
        };
        items.forEach( itm=>{
            if(!sct || sct.id!=itm.sectid){
                nwsct(itm);
            }
            sct.items.push( itm );
            sct.start = Math.min(sct.start, itm.start);
            sct.end = Math.max(sct.end, itm.end);
//if(itm.overlap) console.log((itm.ignoreOverlap?'*':' '), itm.id, itm.start, itm.end, itm.overlap, itm.overlapFrom, itm.overlapBase );
//else console.log((itm.ignoreOverlap?'*':' '), itm.id, itm.start, itm.end );
            json.first = Math.min( json.first, itm.start );
            json.last = Math.max(json.last, itm.end);
        });
        json.sections = scts;
        return json;
    };
}

module.exports = new Parser();
