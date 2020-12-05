function minSizeItems(items, minsize){
    let inc = 0
    let min = 0
    let max = 0

    items.forEach( i => {
        i.min = i.min + inc
        i.max = i.max + inc
        const l = i.max - i.min + 1
        if (l<minsize) {
            inc = inc + (minsize - l)
            i.max = i.max + (minsize - l)
            i.length = i.max - i.min + 1
        }
        min = min==0 ? i.min : Math.min(min, i.min)
        max = max==0 ? i.max : Math.max(max, i.max)
    })

    return {
        min: min,
        max: max,
        inc: inc,
    }
}


function fillgaps(items, max) {
    if (!items.length) {
        return [{
            isfiller: true,
            sectid: 1,
            id: 0,
            min: 1,
            max: max ? max : 2,
            length: max ? max : 2,
            label: 'Filler',
            colorKey: 'filler',
            meta: {
                inhaltKommentar: 'Filler',
            },
        }]
    }

    const ret = []
    let last, lastp=0
    let maxid=0
    const fills = []
    const fillto = max || 0

    const addFill = (t) =>{
        const filler ={
            isfiller: true,
            sectid: last.sectid,
            id: 0,
            min: lastp ? lastp+1 : 1,
            max: lastp ? t.min-1 : t.min,
            label: 'Filler',
            colorKey: 'filler',
            meta: {
                inhaltKommentar: 'Filler',
            },
        }
        filler.length = filler.max - filler.min +1
        ret.push(filler)
        fills.push(filler)
//console.log('++ filler', filler.min, filler.max)
    }

    items.forEach( (i, indx) =>{
        if (last && i.min-lastp>1) {
            addFill(i)
        } else if (indx==0 && i.min>1) {
            last = i
            addFill(i)
        }
        ret.push(i)
        last = i
        lastp = Math.max(i.max, lastp)
        maxid = Math.max(maxid, i.id)
//console.log('++ item', i.min, i.max)
    })

    if (lastp<fillto) {
        addFill({
            min: fillto
        })
    }

    maxid++
    fills.forEach( f => {
        f.id = maxid++
    })

    return ret
}

function normal(jsn){
    const ret = {
        min: 0,
        max: 0,
        length: 0,
        sections: [],
        items: [],
    }

    let romanOffset = 0

    ret.sections = jsn.sections.map( s=>{
        const sect = {
            id: s.id,
            min: 0,
            max: 0,
            length: 0,
        }

        // get pages from folios
        if (s.sections.length) {
            s.sections.forEach( ss =>{
                sect.min = sect.min==0 ? ss[0].page : Math.min(sect.min, ss[0].page)
                sect.max = ss[1] ? sect.max==0 ? ss[1].page : Math.max(sect.max, ss[1].page) : sect.min
            })
            sect.hasFolios=true
            sect.folioRange = {
                min: sect.min,
                max: sect.max,
            }
        }

        // copy attributes
        sect.colorKey = s.colorKey

        //  Iterate items and add to main items
        s.items.forEach( i => {
            const itm = {
                sectid: s.id,
                id: i.id,
                min: sect.min,
                max: sect.max,
                length: 0,
                gid: i.gid,
                glen: i.glen,
                gpos: i.gpos,
            }

            if (i.pages.length) {
                itm.min = i.pages[0].page
                itm.max = i.pages[1] ? i.pages[1].page : itm.min
                itm.isRoman = i.pages[0].pageMeta.type=='r'
                if (itm.isRoman) {
                    romanOffset = Math.max(romanOffset, itm.max)
                }
            }
            itm.length = itm.max - itm.min +1

            // copy attributes
            itm.colorKey = i.colorKey
            itm.label = i.label
            itm.ignoreOverlap = i.ignoreOverlap

            itm.meta = _clone( i.meta )
            delete itm.meta.pages_meta
            delete itm.meta.pages

            sect.min = sect.min==0 ? itm.min : Math.min(sect.min, itm.min)
            sect.max = sect.max==0 ? itm.max : Math.max(sect.max, itm.max)

            ret.items.push(itm);
        })
        sect.length = sect.max - sect.min +1

        ret.min = ret.min==0 ? sect.min : Math.min(sect.min, ret.min)
        ret.max = ret.max==0 ? sect.max : Math.max(sect.max, ret.max)

        sect.meta = _clone( s.meta )

        return sect
    })
    ret.length = ret.max - ret.min + 1
    
    ret.items.forEach( itm => {
        if (!itm.isRoman) {
            itm.min = itm.min + romanOffset
            itm.max = itm.max + romanOffset
        }
    })

    ret.items = fillgaps( ret.items.sort( (a, b) => (a.min==b.min) ? a.id-b.id : a.min-b.min ) )

    ret.meta = _clone( jsn.meta )

    return ret
}

function _clone(o){
    let ret
    if (o instanceof Array) {
        ret = []
        o.forEach( i =>{
            ret.push( _clone(i) )
        })
    } else if (o instanceof Object) {
        ret = {}
        Object.keys(o).forEach( k => {
            ret[k] = _clone(o[k])
        })
    } else {
        ret = o
    }
    return ret
}

// Create PC from normal
function genParallelContent(jsn) {
    const parras = []
    let absmax = 0

    const cleaned = jsn.items.filter( i => {
        absmax = Math.max(absmax, i.max)
        if (i.isfiller) {
            return false
        }
        i.parallels = []
        i.parapos = 0
        return true
    })
//    cleaned.sort( (a, b) => (a.min==b.min) ? a.id-b.id : a.min-b.min )
//debugger

    let nitems = []

    function addParrallel(t, itm) {
        if (itm.pc.pos!=undefined) {
            t.parapos = itm.pc.pos
        } else {
            itm.pc.pos = t.parapos
        }
        // If the PC item has a length of one, try and fit it in before
        let add=true
        if(t.parapos>0 && itm.pc.from==itm.pc.to) {
            for( let i=0; i<t.parapos && add; i++) {
                if (!t.parallels[i]) {
                    t.parallels[i] = itm
                    itm.parapos = i
                    add=false
                }
            }
        }
        if (add) {
            t.parallels[t.parapos] = itm
            itm.parapos = t.parapos
            t.parapos = t.parapos + 1
        }
    }

    let forceOverlap, canOverlap

    function getItemForPage(pnum, iid){
        let ret, citm
        let searcharr = nitems
        
        for (let indx=searcharr.length-1; indx>=0 && !ret; indx--) {
            citm = searcharr[indx]
            if ( citm.id!=iid && citm.min<=pnum && citm.max>=pnum ){
                ret = citm
                ret._indx = indx
            }
        }
        return ret
    }

    function getItemsForItem(itm) {
        let ret = true
        // can not be an overlap
        if (itm.ignoreOverlap) {
            return false
        }
        const startInd = nitems.length-1
        let f = getItemForPage(itm.min, itm.id)
        let t = getItemForPage(itm.max, itm.id)
        let insrt
        if (f) {
            f = f._indx
            // No end found. Means it continues further than current entries
            if (!t) {
                t = startInd
                insrt = _clone( itm )
//                insrt.max = nitems[startInd].max
//console.log('************', itm.max, '=>', insrt.max)
                insrt.min = Math.min(insrt.min, insrt.max-1)
                insrt.length = insrt.max - insrt.min +1

                itm.min = nitems[startInd].max + 1
                itm.max = Math.max(itm.min, itm.max)
                itm.length = itm.max - itm.min +1
                ret = true
            } else {
                t = t._indx
                insrt = itm
                ret = false
            }
            insrt.pc = {
                from: f,
                to: t,
            }
            delete insrt.parallels
            parras.push( insrt )
        }
        return ret
    }

    forceOverlap = []
    canOverlap = []
    cleaned.forEach( oitm => {
        if (oitm.ignoreOverlap) {
            forceOverlap.push(oitm)
        } else {
            canOverlap.push(oitm)
        }
    })

    const isPara = (itm, itmpos) =>{
        if (itm.ignoreOverlap) {
            return false
        }
        let ret = false
        for(let i=0; i<itmpos && !ret; i++){
            let li = cleaned[i]
            ret = (!li.ispara && li.id!=itm.id && li.min<=itm.min && itm.min<li.max)
            if (ret) {
                itm.ispara = true
            }
        }
        return ret
    }

    cleaned.sort( (a,b) => {
        return a.min - b.min
    })

    let posParas=[]

    nitems=[]
    for ( let ii=0; ii<cleaned.length; ii++) {
        const cln = cleaned[ii]
        if (isPara(cln, ii)) {
            posParas.push(cln)
        } else {
            nitems.push(cln)
        }
    }

    nitems.sort( (a,b) => {
        return a.min - b.min
    })

    posParas.forEach( (c, indx) => {
        getItemsForItem(c)
    })

/*
    parras.sort( (a, b) => {
        return a.min==b.min ? b.length-a.length : a.min-b.min
    })
*/

    let paracols = fixParraPos(parras)
//    paracols++
    parras.sort( (a, b) => (a.parapos==b.parapos) ? a.min-b.min : a.parapos-b.parapos )

    nitems.forEach( i => {
        delete i._indx
    })

//console.log('# post para', nitems, parras)

    return {
        items: fillgaps( nitems, absmax ).concat(parras),
        cols: paracols,
    }
}

const fixParraPos = arr => {
    let paracols = 0
    arr.forEach( (p, indx) => {
        p.parapos = p.parapos || 0
        let repeat = true
        while (repeat){
            repeat = false
            for (let i = 0; i<arr.length && !repeat; i++) {
                let pitem = arr[i]
                pitem.parapos = pitem.parapos || 0
                if (pitem.id==p.id) {
                    continue
                }
                if ( (p.min>=pitem.min && p.min<pitem.max)          // p.min inside pitem
                        || (p.max>pitem.min && p.max<=pitem.max)      // p.max inside pitem
                        || (p.min>=pitem.min && p.max<=pitem.max)) {  // p completely inside pitem
    
                    if (pitem.parapos==p.parapos) {
                        p.parapos = Math.max(pitem.parapos + 1, p.parapos)
                        paracols = Math.max(paracols, p.parapos)
                        repeat = true
                    }
                }
            }
        }
        p.isparallel = true
//        delete p.pc
    })
    return paracols + 1
}

const obj  = {
    minSizeItems: minSizeItems,
    fillgaps: fillgaps,
    normal: normal,
    genParallelContent: genParallelContent,
    fixParraPos: fixParraPos,
    clone: _clone,
}

if (module){
    module.export = obj
}

export default obj

