
function xmlstr(str){
    if(typeof str === 'object'){
        return '';
    }
    return str;
}

function getFolioSections(folio){
    const sects = [];
    let f = ''+folio;
    let fl = f.trim().replace(/\-+/g, '-')
                    .replace(/contre\-plat/g, '0') // otherwise ranges get confused
//                    .replace(/quart\.\s+[1234]/g, '')
                    .replace(/\&.+?\;/g, '') // remove html tags
//                    .replace(/marg\./g, '')
//                    .replace(/[fp]\./gi, '')
//                    .replace(/med\./g, '')
//                    .replace(/[abc]/g, '')
                    .replace(/[\<\>\*\'\""]/g, '') // Remove <, >, *, ' and "
//                    .replace(/\".*?\"/g, '') // remove comments
//                    .replace(/inf\./g, '')
                    // Replace roman numerals
//                    .replace(/III/g, '3')
//                    .replace(/II/g, '2')
//                    .replace(/I/g, '1')
                    ;
        let lastt;
        fl.split(',').forEach( sec=>{
            let sc = sec;
            let t = sc.match(/[fp]\./i);
            if(t){
                t = t[0].substr(0,1);
                sc = sc.replace(/[fp]\./i, '').trim();
                lastt = t
            } else {
                t = lastt || 'f';
                lastt = t
            }
            const scpgs = getSectionPages(sc.trim(), t)
            sects.push( scpgs );
        } );
    return sects;
}

function getPN(folioStr, t, isend){
    let fs = folioStr;
    let ret = {
        val: 0,
        type: 'd', // For number type a=alpha, r=roman, d=decimal
        original: folioStr
    };
//console.log('pn', '"'+fs+'"' );
    // Replace strange char codes
    fs = fs.replace( new RegExp( String.fromCharCode(953), 'g') ,'i');
    fs = fs.replace( new RegExp( String.fromCharCode(921), 'g') ,'I');
    // Remove certain strings
    fs = fs.replace(/bis|\*|ter\.|quin\.|sex\./g, '').trim();
    // Fix issue where Vv is not parsed properly
    fs = fs.replace(/Vv/gi, 'Vv').replace(/Vr/gi, 'Vr');
    let ft = 'r'; //isend?'v':'r';
    let vrRegex = /[vr]+$/g;
    if(fs.length>1){
        let nft = fs.match( vrRegex );
        if(nft){
            ft = nft[0];
        }
        fs = fs.replace(vrRegex, '');
    }
    ret.original = fs;
    ret.vr = ft;

    // Determine number type
    if(fs.match(/[a-z]/gi)){
        if(isRoman(fs)){
            ret.type = 'r';
        } else {
            ret.type = 'a';
        }
    }

    // Get value based on type
    let n = 0;
    switch (ret.type) {
        case 'a':
            let vl = 0;
            let ffs = fs.toUpperCase();
            for(let i=0, j=fs.length-1; i<fs.length; i++){
                let m = Math.pow(26, i);
                let v = ffs.charCodeAt(j) - 64; // "A".charCodeAt(0) == 65;
                vl = vl + (m*v);
                j--;
            }
            n = vl;
            break;
    
        case 'r':
            n = Number( replaceRomanNumerals( fs.toUpperCase() ) );
            break;
    
        default:
            n = Number(fs);
            break;
    }

    if( t!='p' && n>0 ){
        n = ((n-1)*2)+1;
        if(ft=='vr' || ft=='rv' ){
            if(isend){
                ft = 'v';
            } else {
                ft = 'r';
            }
            ret.vr = ft;
        }
        if(ft=='v'){
            n=n+1;
        }
    } else {
        // Pages don't have v or r
        ret.vr = '';
    }
    ret.fp = t;
    ret.val = n;
//console.log('        => ' + JSON.stringify(ret) )

    return ret;
}

function getSectionPages(f, type){
    let range = f.trim().split(/\-+/i);
    let firstPage;
    let ret = [];
    // Make sure we have at least 2 so we can have a start and end;
    // Has to be done here so we can use 'rv' etc to calculate the actual end pnum.
    if(range.length==1){
        range.push( range[0] );
    }
    range.forEach( (str,indx)=>{
        let s = ''+str;
        let r = {
            page: null
        };
        const adderr = (e) => {
            r.errors = r.errors || [];
            r.errors.push( e );
        };
//console.log('s', s);
        // expand shortcuts
        s = s.replace(/\s+msup\s+/, ' marg. sup. ')
            .replace(/\s+mi\s+/, ' marg. inf. ')
            .replace(/\s+mx\s+/, ' marg. dextr. ')
            .replace(/\s+msin\s+/, ' marg. sin. ')
            .replace(/\s+mm\s+/, ' marg. med. ');
        // Ensure a,b,c,d markers are space seperated
        s = s.replace(/(\d)([abcd])/g, '$1 $2 ');
        let pc = s.trim().split(/\s+/g);

        let rx;
        for(let i=0; i<pc.length; i++){
            let v = pc[i].toLowerCase();
            if(v=='a' || v=='b' || v=='c' || v=='d') {
                r.zone = v;
            } else if(v == 'marg.'){
                r.margin = pc[i+1];
                i++;
                rx = 'marg.\\s+'+r.margin;
                if(r.margin=='med.') {
                    let mednum = Number(pc[i+1]);
                    if(!isNaN( mednum )) {
                        r.marginMedian = mednum;
                        i++;
                        rx += '\\s+'+mednum;
                    }
                }
                s = s.replace( new RegExp(rx, 'gi'), '');
            } else if(v=='quart.') {
                let qnum = Number( pc[i+1] );
                rx = 'quart.';
                if(!isNaN(qnum)){
                    r.quart = qnum;
                    i++;
                    let qzone = pc[i+1];
                    rx += '\\s+'+qnum;
                    if( qzone=='inc.' || qzone=='med.' || qzone=='des.' ) {
                        r.quartZone = qzone;
                        i++;
                        rx += '\\s+'+qzone;
                    }
                }
                s = s.replace( new RegExp(rx, 'gi'), '');
            } else if(v=='ant.') {
                s = s.replace( new RegExp('ant.', 'gi'), '');
            } else {
            }
        }

        s = s.replace(/quart|inc|med|des|marg|sup|inf|dextr|sin|med|contre\_plat|ant|\*|\./gi, '');
        s = s.replace(/Ι/g, 'I') // Replace bad I
        let pd = s.match(/([0-9]+|[ivxlcdm]+|[a-z]+)([vr]*)/i);
//console.log('pd', s, pd );
        if(pd){
            let pn = getPN( pd[0], type, indx>0);
//console.log(pd[0], pn);
            r.page = pn.val;
            r.pageMeta = {...pn};
        } else {
//            r.page = 0;
//            r.pageMeta = {};
        }
        if(!r.page && r.page!=0){
            if(firstPage){
                r.page = firstPage.page;
                r.pageMeta = {...(firstPage.pageMeta||{})};
            }
        }



//console.log('pc', pc );
        if(indx==0){
            firstPage = r;
        }
        ret.push(r);
    });
    return ret;
}

// Detect if string is purely roman numerals
function isRoman(s){
    return s.replace(/[IVXLCDM]/gi, '').length == 0;
}

// Convert decimal to roman
function decToRoman( dn ){
    let ret = '';
    let v = dn;
    // Create arrays with default conversion with matching indices.
    var decimalValue = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000 ];
    decimalValue.reverse();
    var romanNumeral = ['I', 'IV', 'V', 'IX', 'X', 'XL', 'L', 'XC', 'C', 'CD', 'D', 'CM', 'M'];
    romanNumeral.reverse();
    decimalValue.forEach( (dv, i)=>{
        while(v>=dv){
            v = v-dv;
            ret = ret + romanNumeral[i];
        }
    });
    return ret;
}

// Convert Roman Numerals to decimal number
function romanToDec( rn ){
    // Create arrays with default conversion with matching indices.
    var decimalValue = [4, 9, 40, 90, 400, 900, 1, 5, 10, 50, 100, 500, 1000 ];
    var romanNumeral = ['IV', 'IX', 'XL', 'XC', 'CD', 'CM', 'I', 'V', 'X', 'L', 'C', 'D', 'M'];
    let ev = '0'+(rn?rn.toUpperCase():'');
    let vl = 0;
    romanNumeral.forEach( (rn,i)=>{
        let rx = new RegExp(rn, 'g');
        let m = ev.length;
        ev = ev.replace(rx, '' );
        vl = vl + (((m-ev.length)/rn.length)*decimalValue[i]);
    });
    return vl;
}
function romanReplacer(match, offset, str) {
    let n = romanToDec(match);
    return n;
}
function replaceRomanNumerals( instr ){
    // Bug-fix sometimes charCode 921 is used for I instead of 73
    let s = '';
    for(let i=0; i<instr.length; i++){
        if(instr.charCodeAt(i)==921){
            s = s + 'I';
        } else {
            s = s + instr.charAt(i);
        }
    }
    return s.replace(/[IVXLCDM]+/g, romanReplacer );
}

// Concert and unconcert alpha to decimal
function alphaToDec( an ){
    let vl = 0;
    let ffs = an.toUpperCase();
    for(let i=0, j=an.length-1; i<an.length; i++){
        let m = Math.pow(27, i);
        let v = ffs.charCodeAt(j) - 64; // "A".charCodeAt(0) == 65;
        vl = vl + (m*v);
        j--;
    }
    return vl;
}
function decToAlpha( dn ){
    let ret = '';
    let mpow = 1;
    let v = dn;
    while( Math.pow(27, mpow)<dn ){
        mpow++;
    }
    mpow--;
    let pw = 0, pv;
    while(pw<mpow){
        pv = Math.pow(27, pw);
        pw++;
    }
    let rest = dn - Math.pow(27, mpow);
    if(rest>27){
    } else {
    }
}

module.exports = {
    isRoman: isRoman,
    parser: getFolioSections,
    xmlstr: xmlstr,
    replaceRomanNumerals: replaceRomanNumerals,
    romanToDec: romanToDec,
    decToRoman: decToRoman
};

