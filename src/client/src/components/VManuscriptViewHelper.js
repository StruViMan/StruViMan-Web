const MIN_SEG_HEIGHT = 3

function calcLnHeights(items, bookHeight, minheight){
    let lnsum
    const MIN_H = minheight || MIN_SEG_HEIGHT

    items.forEach(lninfo=>{
        lninfo.ln = Math.log( Math.abs(lninfo.length) + 1 );
        if (!lninfo.gid || lninfo.gpos==0) {
            lnsum += lninfo.ln;
        }
    });

    let _lrepass = true; // Repass all to calc 3px min
    /*
        Make sure each segment height is at least MIN_SEG_HEIGHT (3px)
        Because this algorithm is logarithmic based, we need to repeatedly increase the 
        calculated height for each undersized segment only and adjust the total heights 
        until there are no segments left to resize.
    */
    let _count = 0 // try this 100 times then give up
    while (_lrepass && _count<100) {
        _count++
        _lrepass = false; // Assume all are ok
        let sum2=0;
        let lnratio = (bookHeight/lnsum)
        items.forEach(lninfo=>{
            let h = lninfo.ln * lnratio
            if (h < MIN_H ) {
                lninfo.ln = MIN_H / lnratio
                _lrepass = true // we need to repeat this until we get no areas that are too small
            }
            if (!lninfo.gid || lninfo.gpos==0) {
                sum2 = sum2 + lninfo.ln
            }
        });
        lnsum = sum2;
    }
    items.forEach( inf => {
        inf.pxheight = (inf.ln / lnsum) * bookHeight
    })
}


export default {
    calcLnHeights: calcLnHeights,
}
