<template>
    <div id="app">
        <div style="background-color:#c0c0c0; height: 52px;">
        <div class="heading">Manuscripts</div>
        </div>
        <div class="backgrnd">
          <img src="../static/images/background.png" />
        </div>  
        <div class="list">
            <div class="file" v-for="f in files">
                <div  v-for="row in f.name.replace('.xml', '').split('#')" >
                    <a :href="'./viewmanuscript?url=./'+xmlpage+'/'+f.id">{{ row }}</a>
                </div>                
            </div>
        </div>
        <div class="footer">
          <a href="https://www.uni-muenchen.de" target="_blank">
          <el-tooltip class="item" effect="dark" content="Ludwig-Maximilians-Universität München" placement="bottom" :hide-after="3000">
          <img src="../static/images/lmulogo.png" alt="LMU-Logo" style="padding-left: 3px"/></el-tooltip></a>

          <a href="https://erc.europa.eu" target="_blank">
          <el-tooltip class="item" effect="dark" content="European Research Council" placement="bottom" :hide-after="3000">          
          <img src="../static/images/erclogo.png" alt="ERC-Logo"/></el-tooltip></a> 

          <a href="https://www.itg.uni-muenchen.de" target="_blank">
          <el-tooltip class="item" effect="dark" content="IT-Gruppe Geisteswissenschaften -
LMU Center for Digital Humanities" placement="bottom" :hide-after="3000">
          <img src="../static/images/itglogo.png" alt="ITG-Logo"/></el-tooltip></a>  

          <a href="http://www.paratexbib.eu" target="_blank">
          <el-tooltip class="item" effect="dark" content="Paratexts of the Bible" placement="bottom" :hide-after="3000">
          <img src="../static/images/ptblogo.png" alt="PTB-Logo"/></el-tooltip></a>       

        </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'XMLFiles',
    props: {
        xmls: {
        },
        xmlpage: {
            default: 'testxml'
        }
    },
    computed: {
        files: function(){
            return this.xmls || [];
        }
    },
    components: {
    }
  }
  </script>
  
  <style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
  }

  .backgrnd {
  position: fixed;
  top: 60px;
  overflow: hidden;
  height: calc( 100vh - 99px);
}

.backgrnd > img {
  width: calc( 100vw - 16px);
  opacity: 0.2;
}

.heading {
font-weight: bold;
font-size: x-large;
text-decoration: underline;
padding: 12px 5px 20px 12px; 
}

.list {
    position: fixed;
    width: calc(100vw - 16px);
    height: calc(100vh - 97px);
    overflow-y: auto;
}

.file {
    padding: 7px 12px;
}


.file:nth-child(odd) {
    background: #ddd;
}


.file:hover {
    background-color:#F3F781;
}

.footer {
  background-color:#c0c0c0;
  position: fixed;
  bottom: 4px;
  width: calc( 100vw - 16px);
  height: 31px;
  padding-left: 3px;
  display: flex;
}

.footer img {
  height: 30px;
}

.footer > a {
  padding-right: 7px;
}

  </style>

