<!--
      VManuscriptView

      The starting point for the SVG graphic rendering.

      Calculates the basic dimension for the dependant components. Also responsible for label positioning.

      Renders the title and headings in native SVG.

      Here the JSON is parsed to calculate how large each piece of content should be and thus the production unit sizes.

-->
<template>
        <div :id="id">
          <svg :width="width" :height="height+27" xmlns="http://www.w3.org/2000/svg"
              class="manuview"
              v-on:click="svgselect"
          >
            <rect :x="0" :y="0" :width="width" :height="height+27" fill="#fff"   />

            <g >
              <title >{{$t('manu.logo')}}</title>
              <a :href="logolink" target="_blank">
                <image :href="logo" height="5%" width="32" x="10" y="30"/>
              </a>
            </g>

              <text class="label-heading"
                  v-if="showculabels"
                  :x="10"
                  :y="18"
              >{{ $t('manu.pu') }}</text>
      
              <text class="label-heading"
                  v-if="showseglabels"
                  :x="bookLeft + bookWidth + 23"
                  :y="18"
              >{{ $t('manu.pc') }}</text>
      
          <g :transform="'translate(0, '+(18+8)+')'" >
            <VCoverpart :x="bookLeft" :y="0" :width="bookWidth+20" :height="40" :backwidth="backwidth"
            />
      
            <VCoverpart :x="bookLeft" :y="height-40-titleHeight-titleBorder-titleBorder" :width="bookWidth+20" :height="40" :backwidth="backwidth" 
              type="bottom" 
            />
      
            <VManuBlock v-for="b in blocks"
                :pos="b.pos"
                :showlabel="showculabels"
            ></VManuBlock>
      
            <VManuBlock v-for="b in itemblocks"
                :pos="b.pos"
                :showlabel="showseglabels"
                @enter="segmentEnter"
                @leave="segmentLeave"
            ></VManuBlock>
            
      
            <VLabel 
              :x="postPlusLabel.x" :y="postPlusLabel.y"
              :text="postPlusLabel.text" 
              :color="'#f00'"
              :labelid="postPlusLabel.lid" 
              :viewid="postPlusLabel.vid" 
              v-on:select="fitAllLabels"
              v-if="postPlusLabel && showseglabels"
            ></VLabel>
      
              <text 
                  v-for="t in titlelines"
                  v-if="showtitle"
                  :x="t.x"
                  :y="t.y"
                  :font-size="titleFontSize"
              >{{t.text}}</text>
      
             <polyline v-if="selectedPolyPoints" 
                 :points="selectedPolyPoints"
                 fill="none"
                 :stroke="selcol"
                 dtroke-width="40"
             />
      
          </g>
          </svg>
        </div>
      </template>
      
      <script>
      import VLabel from '@/components/VLabel';
      import VCoverpart from '@/components/VCoverpart';
      import VManuBlock from '@/components/VManuBlock';
      
      import Colors from '../utils/colors'

      import manuHelper from '../utils/manuhelper'
      import viewHelper from './VManuscriptViewHelper'

      const extend = require('extend');

      const MIN_SEG_HEIGHT = 3;
      
      let labelHeight = 12; // Height of labels. Used for calculation only. Does not affect text height

      function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var reader = new FileReader();
          reader.onloadend = function() {
            callback(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      }

      let irhtlogo
      toDataURL('../../static/images/irhtlogo_grau.png', durl => {
        irhtlogo = durl
      })

      let ptblogo
      toDataURL('../../static/images/ptblogo_grau.png', durl => {
        ptblogo = durl
      })
      
      
      function nudgeLabelsUp(labels, startAt){
        let t=startAt;
        for(let i=labels.length-1; i>=0; i--){
          let l = labels[i];
          if(l.y>t){
            l.y = t;
          }
          t = l.y - l.h;
        }
      }
      
      function nudgeLabelsDown(labels, startAt){
        let t=startAt;
        labels.forEach((l)=>{
          if(l.y-l.h<t){
            l.y = t+l.h;
          }
          t = l.y;
        });
      }

      function nudgeUpSqueeze(labels, startAt){
        let req =  labels[labels.length-1].y - startAt;
        let lh = labels[0].h;
        if( req<1 ){
          return;
        }

        const rup = (ps, amnt) => {
          const mvby = Math.min(req, amnt);
          for(let j=labels.length-1; j>=ps; j--){
            labels[j].y = labels[j].y - mvby;
          }
          req = req - mvby;
        }
        
        for(let i=labels.length-1; i>0 && req>0; i--) {
          let l = labels[i];
          let pl = labels[i-1];
          let gp = (l.y-l.h) - pl.y;
          if( gp > 0) {
            rup(i, gp);
          }
        }
      }

      // Make sure labels are not overlapping.
      // Use a running total to ensure that the top or bottom is below or above the previous label.
      function positionLabels(labels, top, bottom){
        if (!labels.length) {
          return
        }
        let midPoint = (bottom-top)/2;
        let lh;
        let upperLabels = [];
        let lowerLabels = [];
        let ls = [].concat(labels);
        ls.sort((a,b)=>{
          return a.y-b.y;
        });
        ls.forEach(l=>{
          if(l.y-l.h<midPoint){
            upperLabels.push(l);
          } else {
            lowerLabels.push(l);
          }
          if(!lh){
            lh = l.h;
          }
        });
      
        nudgeLabelsDown(ls, top);
        nudgeLabelsUp(ls, bottom);
        nudgeLabelsDown(ls, top);
        nudgeUpSqueeze(ls, bottom);
      }
      
      
      let txtel;
      function textlen(txt, fontSize){
        let fs = fontSize || 10;
          if(!txtel){
              let bdy = document.getElementsByTagName('body')[0];
              txtel = document.createElement('span');
              txtel.style="position:absolute; left: -9999px; font-size: 10px;";
              bdy.appendChild(txtel);
          }
          txtel.style['font-size'] = fs+'px';
          txtel.innerHTML = txt;
          return txtel.offsetWidth;
      }
      
      function fitTextMultiline(texts, maxLength, fontSize){
        let ts = texts;
        let lines=[];
        let line, nextline=[];
        if(typeof ts == 'string'){
          ts = ts.split(/\s/g);
          if(ts.length==1){
            ts = ts[0].split('');
          }
        }
        line = [].concat(ts);
        const fitLine = () => {
          while( textlen(line.join(' '), fontSize)>maxLength){
            nextline.unshift( line.pop() );
          }
          let rt = { text:  line.join(' ')  };
          rt.length = textlen(rt.text, fontSize);
          lines.push(rt);
          line = nextline;
          nextline = [];
        }
        while(line.length){
          fitLine();
        }
        return lines;
      }
      
      function fitText(text, maxLength){
        let ret = ''+text;
        let l = textlen(ret);
        while(l>maxLength){
          ret = ret.substr(0, ret.length-5)+'...';
          l = textlen(ret);
        }
        return {text: ret, length: l};
      }
      
      let lid=1;
      let nextViewid = 1;
      
      // ID counter for createPos
      let posid = 0;
      
        export default {
          name: 'VManuscriptView',
          components: {
            VLabel,
            VCoverpart,
            VManuBlock
          },
          props: {
            manuscript: {
              required: true
            },
            width: {
              required: true
            },
            height: {
              required: true
            },
            // Width of the graphically section
            bookWidth: {
                default: 400
            },
            // How to size the section items. Can be:
            //    'equal' - All items are equally sized
            //    'logarithmic' - Section height is ratio of ln(1+sectionPageCount) / sum( ln(1+sectionPageCount)  );
            //    'proportional' default - Items are sized according to their page count in relation to the total pagecount
            //    'sectionequal' - Sections are equally sized and the items are equally sized.
            //    'regionequal' - Sections are proportionally sized based upon page count and items are equally sized within each section.
            mode: {
                default: 'proportional'
            },
            // Should we show the labels
            showlabels: {
              default: true
            },
            showculabels: {
              default: true
            },
            showseglabels: {
              default: true
            },
            showtitle: {
              default: true
            },
            showparallel: {
              default: false
            },
            selcol: {
              default: '#0f0'
            },
            id: {
              default: '_no_'
            }
          },
          mounted: function(){
            this.bookRight = this.bookLeft+this.bookWidth;
            this.calcBook();
            this.sections = null;
          },
          computed:{
            logolink(){
              if (this.manuscript.meta.manuPTB=='PTB') {
                return 'http://www.paratexbib.eu/'
              }
              return 'https://www.irht.cnrs.fr/'
            },
            logo(){
              if (this.manuscript.meta.manuPTB=='PTB') {
                return ptblogo
              }
              return irhtlogo
            },
            blocks: function(){
              const scts = this.orderedSections;
              return this.svgblocks;
            },
            orderedSections: function(){
              if(!this.sections){
                this.sections = this.buildSections()
              }
              return this.sections;
            },
            selectedObject: function(){
              return this.selectedSection || this.selectedItem;
            },
            backwidth: function(){
              return (this.bookRight-this.bookLeft) * 0.15;
            },
            titlex: function(){
              return ( this.width - textlen(this.title, this.titleFontSize) )/2;
            },
            title: function(){
              return this.$store.getters.manutitle( this.manuscript );
            },
            titlelines: function(){
              if(!this._titles){
                let y = this.height-this.titleBorder - this.titleHeight + this.titleLineHeight;
                this._titles = fitTextMultiline( this.title, this.width-10, this.titleFontSize );
                this._titles.forEach(t=>{
                  t.x = (this.width-t.length)/2;
                  t.y = y;
                  y = y + this.titleLineHeight + 2;
                });
              }
              return this._titles;
            }
          },
          methods: {
            getColor: function(type, key, id){
              let k = (typeof type=='string'?type:'_empty');
              this.manuscript._colors = this.manuscript._colors || {};
              let clrs = this.manuscript._colors;
              let c, rt;
              if(clrs[key] && clrs[key][type]){
                c = clrs[key][type].color;
                rt = clrs[key][type];
                if(id && clrs[key][type].ids[id]){
                  c = clrs[key][type].ids[id].color;
                  rt = clrs[key][type].ids[id];
                } else if(id){
                  clrs[key][type].ids[id]= {
                    name: id,
                    color: c,
                    visible:true
                  };
                  rt = clrs[key][type].ids[id];
                }
              } else {
                c = Colors.get(k, key);
                clrs[key] = clrs[key] || {};
                clrs[key][type] = { ids:{}, visible:true };
                clrs[key][type].color = c;
                clrs[key][type].name = key;
                rt = clrs[key][type];
                if(id){
                  clrs[key][type].ids[id] = {
                    name: id,
                    color: c,
                    visible:true
                  };
                  rt = clrs[key][type].ids[id];
                }
                if (this._cto) {
                  clearTimeout(this._cto)
                }
                this._cto = setTimeout(()=>{
                  delete this._cto
                  this.$store.commit('updateManuscript', this.manuscript );
                }, 500);
              }
              return rt; //c;
            },
            redraw: function(){
              this.itemselect();
              this.sections = null;
            },

            // Calculate the positions of each section and its items
            buildSections: function(){
              // Initialisation
                let ret = [];
                let nextcuid=1;
                let y=this.bookTop; // Running height for all sections
                let cuWidth = this.backwidth;
                let itemWidth = (this.bookRight-this.bookLeft) * 0.75;
                let inhLabels=[]; // Store item labels so we can position them
                let cuLabels=[]; // Store section labels so we can position them
                let maxculen = 0;
              
                // Holds the number of visible non parallel content items
                let visibleItems = 0

                // Need location of last section in case we need to add '...' for too many sections.
                let lastSection;

                //
                this.selectedPolyPoints = undefined;

                this.svgblocks = [];
                this.itemblocks = [];

                // Calculate the max width of texts;
                let textMaxWidth = ((this.width-this.bookWidth)/2)-30;
                // Helper function to get basic label position based on section or item position
                let genLabel = (pos, text, w)=>{
                    pos.selected = false;
                    let ret = {};
                    ret.x = 0;
                    ret.y = (pos.y + (pos.h/2)) + (labelHeight/2) - 3;
                    ret.h = labelHeight; 
                    ret.text = fitText( text, w || textMaxWidth );
                    ret.w = ret.text.length;
                    ret.text = ret.text.text;
                    ret.select = {color:false, points:''};
                    ret.vid = this.viewId;
                    ret.lid = lid++;
                    return ret;
                };

                // Helper function to create a basic pos for use in an svgblock
                let createPos = ( posType, posParent )=>{
                    let ret = {};

                    ret.id = posid++;
                    ret.children = [];
                    ret.type = posType;
                    ret.parent = posParent;
                    ret.meta = {};
                    if(posType=='cu'){
                        ret.anchor = 'end';
                    } else {
                        ret.anchor = 'start';
                    }
                    ret.wid = this.id;

                    return ret;
                };

              // Build section matrix
              const sects = {}
              this.manuscript.sections.forEach( s => {
                  let colObj = this.getColor( s.colorKey, 'cu' )
                  const ns = manuHelper.clone( s )
                  ns.colObj = colObj
                  ns.label = s.label
                    ns.label = ns.meta.cuNummer+ '\u00A0\u00A0' + (ns.meta.cuDatum  ? '[s. '+ns.meta.cuDatum+']' : '')
                  sects[s.id] = ns
                  if (colObj.visible){
                    maxculen = Math.max(maxculen, textlen(ns.label) );
                  }
              })
              this.bookLeft = Math.max(maxculen+30, 50)
              this.bookRight = this.bookLeft+this.bookWidth;

              // Create a CU Block item for a sectid
              const genSectBlock = (sectid)=>{
                  const sect = sects[sectid] = sects[sectid] || {
                    id: sectid,
                    label: 'Sect not found: ' + sectid,
                    meta: {},
                  }

                  const cu = {}
                  cu.id = sect.id
                  cu.pos = createPos('cu');
                  cu.pos.x = this.bookLeft;
                  cu.pos.w = cuWidth;
                  cu.pos.color = sect.colObj.color;
                  cu.pos.visible = sect.colObj.visible;
                  cu.pos.meta = sect.meta;
                  cu.svgblock = { pos: cu.pos };
                  cu.label = sect.label || 'No Label: ' + cu.label
                  cu.items = [];
                  cu.meta = {};
                  extend(true, cu.meta, sect.meta );
                  return cu
              }

              // Get normal items
              let jsn = manuHelper.normal(this.manuscript)

              // Get array based on PC or not
              let items
              let paraitems = []
              let paracols = 1

              if (this.showparallel) {
                items = manuHelper.genParallelContent( jsn )
                paracols = items.cols
                items = items.items.filter( i => {
                  if (i.isparallel) {
                    paraitems.push(i)
                    return false
                  }
                  return true
                })
              } else {
                items = jsn.items
                items.forEach( itm => {
                  delete itm.gid
                  delete itm.gpos
                  delete itm.glen
                })
              }

              // Calculate visible items
              let dmin = 0
              let dmax = 0
              let tlen = 0
              let ratioItemsLength = 0
              const fillerColObj = this.getColor( 'filler', 'segment' )
              const itemFilterFunc = i => {
                  let sect = sects[i.sectid]
                  if (!sect || !sect.colObj.visible) {
                    return false
                  }
                  i.colObj = i.colObj || this.getColor( i.colorKey, 'segment' )
                  if (i.colObj.visible) {
                    dmin = dmin==0 ? i.min : Math.min(dmin, i.min)
                    dmax = dmax==0 ? i.max : Math.max(dmax, i.max)
                    if (i.gid==undefined || i.gpos==0) {
                      tlen = tlen + i.length
                      ratioItemsLength++
                    }

                    sect.label = sect.meta.cuNummer+ '\u00A0\u00A0' + (sect.meta.cuDatum  ? '[s. '+sect.meta.cuDatum+']' : '')

                    i.meta.inhaltPages = i.min+'-'+i.max+' ('+i.length+')'

                    return true
                  }
                  return false
              }
              paraitems = paraitems.filter(itemFilterFunc)
              tlen=0
              ratioItemsLength=0
              items = items.filter(itemFilterFunc)

              let dlen = dmax - dmin +1

              // rework items to get better fillers
              const regap = arr => {
                let ret = arr.filter( i => {
                  return !i.isfiller
                })
                const mx = dmax
                return manuHelper.fillgaps( ret, mx ).map( i => {
                    if (i.isfiller) {
                      i.colObj = fillerColObj
                    }
                    return i
                })
              }

              let newitems=[]
              newitems = regap(items.filter( i => !i.isparallel ))
              items = newitems

//              tlen = this.manuscript.last

              // Calc heights based on selected option
               if( this.mode=='proportional'){
                   let itmhratio = this.bookHeight / tlen
                   let ph, 
                       remainheight=this.bookHeight,
                       remainlen = tlen
                   items.forEach( i => {
                     ph = i.length * itmhratio
                     if (ph<MIN_SEG_HEIGHT) {
                        i.pxheight = MIN_SEG_HEIGHT
                        remainheight = remainheight - MIN_SEG_HEIGHT
                        if (!i.gid || i.gpos==0) {
                          remainlen = remainlen - i.length
                        }
                     }
                   })
                   // 2nd Pass cal remaining
                   itmhratio = remainheight / remainlen
                   items.forEach( i => {
                     if (!i.pxheight) {
                        i.pxheight = i.length * itmhratio
                     }
                   })
               } else if (this.mode=='logarithmic') {
                   viewHelper.calcLnHeights(items, this.bookHeight, MIN_SEG_HEIGHT)
               } else if (this.mode=='equal') {
                   const itmh = this.bookHeight / ratioItemsLength
                   items.forEach( i => {
                     i.pxheight = itmh
                   })
               }

                const completeItem = (info, dontAdd)=>{
                    // Calc line sources
                    info.pos.srcx = info.pos.x + info.pos.w;
                    info.pos.srcy = info.pos.y+(info.pos.h/2);
                    // Build label
                    let ilabel = genLabel( info.pos, info.label, this.width-(info.pos.x + info.pos.w + 20) );
                    ilabel.x = this.bookRight + 20;
                    ilabel.sortval = info.pos.y + info.pos.h/2;
                    ilabel.srcx = info.pos.x + info.pos.w;
                    ilabel.srcy = info.pos.y + (info.pos.h/2);
                    ilabel.visible = true;
//                    ilabel.visible = this.showseglabels;
                    info.pos.label = ilabel;
                    if(ilabel.visible || dontAdd){
                      inhLabels.push(ilabel);
                    }
                }

              // 
              const getItemBlock = (itm, cu)=>{
                  let info = {
                      label: itm.label,
                      start: itm.min,
                      end: itm.max,
                      range: itm.length
                  };
                  info.pos = createPos('info', cu );
                  info.pos.meta = {};
                  info.isfiller = itm.isfiller
                  extend(true, info.pos.meta, itm.meta );
                  info.pos.color = itm.colObj.color;
                  info.pos.visible = itm.colObj.visible;
                  info.pos.w =  (this.bookRight-this.bookLeft) * 0.75
                  info.pos.x = this.bookRight-info.pos.w;

                  if (itm.gid) {
                    info.pos.w = info.pos.w / itm.glen
                    const gp = (itm.glen-1) - itm.gpos
                    info.pos.x = info.pos.x + (info.pos.w * gp)
                    info.gid = itm.gid
                    info.gpos = itm.gpos
                  }

                  cu.svgblock.pos.children.push(info)

                  return info
              }

              // Generate blocks based on items.
              // If parallel in blocks, check also CU change
              const sblocks=[]
              const iblocks=[]
              const pcsblocks=[]
              const pcslabels=[]
              const pciblocks=[]

              let currcu
              const finishcu = (pcu, keep, pusharr) => {
                  const wcu = pcu || currcu
                  const parr = pusharr || cuLabels
                  if (wcu) {

                      // Build label
                      let cul = genLabel( wcu.pos, wcu.label, this.bookLeft - 20 );
                      cul.x = wcu.pos.x - 20;
                      cul.visible = this.showculabels;
                      // Store label for ordering
                      parr.push( cul );
                      wcu.pos.label = cul;
                      wcu.pos.srcx = wcu.pos.x;
                      wcu.pos.srcy = wcu.pos.y+(wcu.pos.h/2);

                      sblocks.push(wcu.svgblock)
                      if (!keep) {
                        currcu = undefined
                      }
                  }
              }
              const nextcu = itm => {
                  if(currcu && currcu.id==itm.sectid) {
                    return
                  }
                  finishcu()
                  currcu = genSectBlock(itm.sectid)
                  currcu.pos.h = 0
                  return currcu
              }

              const maincus=[]
              let mainitems=[]

              // Calculates the non PC CU for a page number
              // Used for PC and is only effective after mainitems is populated
              const getCUforPage = (pnum, isend) => {
                let ret
                for (let i=0; i<maincus.length && !ret; i++) {
                  let cu = maincus[i]
                  if (pnum>=cu.min && pnum<=cu.max) {
                    ret = cu
                  }
                }
                return ret
              }

              // Caclcultaes the Y position for a page number
              // Used for PC and is only effective after mainitems is populated
              const getYforPage = (pnum, isend) => {
                let ret
                let atend = false
                for (let i=0; i<mainitems.length && !ret; i++) {
                  const itm = mainitems[i]
                  if (pnum>=itm.start && pnum<=itm.end) {
                    const rat = itm.pos.h / ((itm.end-itm.start)+1)
                    if (isend && pnum==itm.end) {
                      ret = itm.pos.y + itm.pos.h
                      atend = true
                    } else {
                      ret = itm.pos.y + ((pnum - itm.start) * rat)
                    }
                  }
                }

                if (!ret) {
                  let ritm
                  if (isend) {
                    ritm = mainitems[mainitems.length]
                  } else {
                    ritm = mainitems[0]
                  }
                  for (let i=0; i<mainitems.length; i++) {
                    const itm = mainitems[i]
                    if (isend) {
                      if (pnum>=itm.end) {
                        ritm = itm
                      }
                    } else {
                      if (pnum<=itm.start) {
                        ritm = itm
                      }
                    }
                  }
                  if (isend) {
                    ret = ritm ? ritm.pos.y + ritm.pos.h : dmax
                    atend = true
                  } else {
                    ret = ritm ? ritm.pos.y : 1
                  }
                }

                return {
                  pos: ret,
                  atend: atend,
                }
              }

              // Populate mainitems
              items.forEach( i => {
                  if (i.isparallel) {
                    return
                  }
                  const ccu = nextcu(i)
                  if (ccu) {
                    ccu.pos.y = y
                    ccu.min = i.min
                    maincus.push(ccu)
                  }
                  currcu.max = i.max
                  const itm = getItemBlock(i, currcu)
                  itm.pos.y = y
                  itm.pos.h = i.pxheight
                  if (i.gpos!=undefined && i.gpos<(i.glen-1)) {
                    itm.pos.borderLeft = 1
                  }
                  completeItem(itm)
                  mainitems.push(itm)
                  // it's not an empty item
                  if (!itm.isfiller) {
                      iblocks.push(itm)
                  }

                  lastSection = itm

                  if (i.gid==undefined || i.gpos==(i.glen-1)) {
                    currcu.pos.h = currcu.pos.h + itm.pos.h
                    y = y+itm.pos.h
                  }
              })

              //cu.svgblock.pos.children.push(info)
              currcu.svgblock.pos.children.sort( (i1, i2) => {
                  if (i1.gid==i2.gid) {
                    return i1.gid!=undefined ? i2.gpos-i1.gpos : 0
                  }
                  return 0
              })

              finishcu()

              let paracu
              let lastParaItem
              paraitems.forEach( i => {
                
                  let maincu = getCUforPage(i.min)
                  // No CU so it's proly not visible
                  if (!maincu) {
                    console.warn('NO CU found for', i.min, i, maincus )
                    return
                  }
                  // Item belongs to different cu than being used
                  let shouldFinishCU = (paracu && paracu.id!=i.sectid)
                  shouldFinishCU = shouldFinishCU || (lastParaItem && (i.min-lastParaItem.max)>1)
                  if (shouldFinishCU) {
                     finishcu(paracu, true, pcslabels)
                     paracu = null
                  }
                  // Not main cu, so create a new one
                  if (i.sectid != maincu.id) {
                      paracu = genSectBlock(i.sectid)
                      paracu.pos.h = 0
                      paracu.pos.w = maincu.pos.w / 2
                      paracu._new = true
                      pcsblocks.push(paracu)
                  }
                  // create a new Item
                  const pcblk = getItemBlock(i, paracu || maincu)
                  const pswid = ((pcblk.pos.w * 0.95)*0.8) / Math.max(paracols, 2)
                  pcblk.pos.x = pcblk.pos.x+(pcblk.pos.w * 0.95) - (pswid*(i.parapos+1))
                  pcblk.pos.w = pswid

                  const posStart = getYforPage(i.min) // {pos:y, atend: bool }
                  const posEnd = getYforPage(i.max, true)

                  pcblk.pos.y = posStart.pos
                  pcblk.pos.h = posEnd.pos - pcblk.pos.y
                  if (pcblk.pos.h < MIN_SEG_HEIGHT) {
                    pcblk.pos.h = MIN_SEG_HEIGHT
                    if (posEnd.atend) {
                      pcblk.pos.y = Math.max(0, posEnd.pos - pcblk.pos.h)
                    }
                  }

                  if (paracu) {
                    pcblk.pos.borderLeft = 2
                  } else {
                    pcblk.pos.borderLeft = 1
                  }

                  completeItem(pcblk)
                  pciblocks.push(pcblk)

                  if (paracu) {
                    if (paracu._new) {
                      paracu.pos.y = pcblk.pos.y
                    }
                    paracu.pos.h = Math.max(paracu.pos.y+paracu.pos.h, pcblk.pos.y+pcblk.pos.h) - paracu.pos.y
                  }

                  lastParaItem = i
              })
              if (paracu) {
                finishcu(paracu, true, pcslabels)
              }

              let cw
              pcsblocks.forEach( blk => {
                let mn = 999999
                let mx = 0
                cw = cw || (blk.pos.w*2)
                blk.pos.children.forEach( ch => {
                  mn = Math.min(ch.start, mn)
                  mx = Math.max(ch.end, mx)
                })
                blk.min = mn
                blk.max = mx
                blk.length = (mx-mn)+1
              })

              // Fix para CU widths & positions
              const pccols = manuHelper.fixParraPos( pcsblocks.sort( (a, b) => a.min==b.min ? a.length-b.length : b.min-a.min ) )
              cw = cw / Math.max(pccols+1, 2)

              pcsblocks.forEach( blk => {
                  blk.pos.w = cw
                  blk.pos.x = blk.pos.x + (cw * blk.parapos)
                  blk.pos.srcx = blk.pos.x
              })

              pcsblocks.sort( (a, b) => a.parapos-b.parapos)

              this.svgblocks = sblocks.concat(pcsblocks)
              this.itemblocks = iblocks.concat(pciblocks)

              // Position labels
        
                inhLabels.sort((a,b) => {
                    return a.sortval - b.sortval;
                });

                const trimLabels = (lbls)=>{
                    const ret = [];
                    const btm = posBottom;
                    lbls.forEach( l => {
                        if(l.visible && l.y <= btm) {
                            ret.push(l);
                        } else {
                            l.visible=false;
                        }
                    });
                    return ret;
                };

                let visLbls = inhLabels.filter(l=>{ return l.visible;});
                let labelPositionMargin = (this.height - this.bookHeight) / 4;
                let posBottom = this.bookTop+this.bookHeight + labelPositionMargin - 10;
                positionLabels( inhLabels, this.bookTop-labelPositionMargin+5, posBottom );
                let filtered;
                filtered = trimLabels( inhLabels );
                if( filtered.length < inhLabels.length ) {
                  this.postPlusLabel = genLabel( {y: posBottom ,h: labelHeight }, this.$t('show.allitems') );
                    this.postPlusLabel.x = lastSection.pos.x + lastSection.pos.w + 20;
                    this.postPlusLabel.labelcount = inhLabels.length;
                    this.postPlusLabel.maxy = inhLabels[inhLabels.length-1].y;
                    filtered.push( this.postPlusLabel );
                } else {
                    this.postPlusLabel = null;
                }
                positionLabels( cuLabels.concat(pcslabels), this.bookTop-labelPositionMargin+5, this.bookTop+this.bookHeight + labelPositionMargin - 10 );

                return items
            },


            fitAllLabels: function(){
              let bh = this.postPlusLabel.maxy; 
              bh = bh + 100 + this.titleHeight + this.titleBorder + this.titleBorder  + 20;
              this.calcBook( bh );
              this.sections = null;
              this.$emit('setheight', bh  );
            },
            calcBook: function( newHeight ){
              let h = newHeight || this.height;
              this.bookTop = 50;
              this.bookHeight = h - 100 -this.titleHeight-this.titleBorder-this.titleBorder;
              this._titles = null;
            },
            updateSelection: function(){
              if(this.selectedObject){
                 this.selectedPolyPoints = this.pospoints(this.selectedObject.pos, 1);
              } else {
                this.selectedPolyPoints = null;
              }
            },
            reselect(){
              if (this.selectedItem) {
                this.itemselect( this.selectedItem )
              } else if (this.selectedSection) {
                this.sectionselect( this.selectedSection )
              }
            },
            itemselect: function(itm){
              this.selectedSection = null;
              if(itm){
                this.selectedItem = itm;
                this.updateSelection();
                this.$bus.$emit('labelselect', {
                  vid: this.viewId,
                  id: this.selectedItem.pos.label.lid,
                  select: {
                    color: this.selcol,
                    points: this.labelpoints(this.selectedItem.pos.label, 3)
                  }
                });
                this.$emit('itemselect', itm);
              } else {
                this.selectedItem = null;
                this.updateSelection();
              }
            },
            sectionselect: function(s){
              this.selectedItem = null;
              if(s){
                this.selectedSection = s;
                this.updateSelection();
                this.$bus.$emit('labelselect', {
                  vid: this.viewId,
                  id: this.selectedSection.pos.label.lid,
                  select: {
                    color: this.selcol,
                    points: this.labelpoints(this.selectedSection.pos.label, 3)
                  }
                });
                this.$emit('sectionselect', s);
              } else {
                this.selectedSection = null;
              }
            },
            svgselect: function(){
              this.itemselect();
              this.$emit('select');
            },
            pointStr: function(x, y){
              return x+', '+y;
            },
            points: function(p, offset){
              let ret = '';
              let off = offset!=undefined?offset:5;
      
              ret += this.pointStr(p.x-off, p.y-off);
              ret += ' '+this.pointStr(p.x+p.w+off, p.y-off);
              ret += ' '+this.pointStr(p.x+p.w+off, p.y+p.h+off);
              ret += ' '+this.pointStr(p.x-off, p.y+p.h+off);
              ret += ' '+this.pointStr(p.x-off, p.y-off);
              return ret;
            },
            pospoints: function(p, offset){
              let p2 = {
                x: p.x,
                y: p.y,
                w: p.w,
                h: p.h
              };
              if(p.type=='cu'){
                p2.w = this.bookWidth;
              }
              return this.points( p2, offset );
            },
            labelpoints: function(l, offset){
              let ret;
              let p = {
                x: l.x,
                y: l.y-l.h +5,
                w: l.w,
                h: l.h-5
              };
              if(this.selectedSection){
                p.w = textlen(l.text);
                p.x = p.x - p.w;
              }
              ret = this.points( p, offset );
              return ret;
            },
            segmentEnter: function(evt){
              this.$bus.$emit('segment.enter', evt )
            },
            segmentLeave: function(evt){
              this.$bus.$emit('segment.leave', evt )
            },
          },
          data: function(){
            this.$bus.$on('select.block', evt=>{
              const ps = evt.pos;
              if(ps && ps.wid==this.id){
                this.selectedPolyPoints = this.pospoints(ps, 2);
              } else if(evt.wid==this.id) {
                this.selectedPolyPoints = undefined;
              }
            });
            return {
              colors: {},
              sections: undefined,
              highlighted: null,
              bookLeft: 180,
              bookRight: 650,
              bookTop: 50,
              bookHeight: 200,
              selectedItem: null,
              selectedSection: null,
              titleFontSize: 16,
              titleHeight: 38,
              titleLineHeight: 18,
              titleBorder: 4,
              viewId: nextViewid++,
              selectedPolyPoints: null,
              postPlusLabel: null,
              parallelItems: [],
              itemlabels: [],
              svgblocks: [],
              itemblocks: [],
            };
          },
          watch: {
              width: function(newVal, oldVal){
                this.bookRight = this.bookLeft+this.bookWidth;
                this.calcBook();
                this.sections = null;
              },
              height: function(newVal, oldVal){
                this.bookRight = this.bookLeft+this.bookWidth;
                this.calcBook( newVal );
                this.sections = null;
              },
              bookWidth: function(newVal, oldVal){
                this.bookRight = this.bookLeft+newVal;
                this.calcBook();
                this.sections = null;
              },
              mode: function(newVal, oldVal){
                this.sections = null;
              },
/*
              showparallel: function(newVal, oldVal){
                if(newVal != oldVal){
                  this.sections = null;
                }
              }
*/
          }
        }
      </script>
      
      <style>
        .label-heading {
          font-size: 16px;
          font-weight: bold;
          text-decoration: underline;
        }
      </style>
      
      <style scoped>
        /* CSS */
        svg {
          margin-top: 10px;
        }
      </style>
      