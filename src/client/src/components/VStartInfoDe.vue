<template >
        <span class="bgrndinfo" :style="backgroundStyle">
                <div style="float: right; margin-top:23px;">
                <a href="/sample.html">
                <el-tooltip class="item" effect="dark" :content="$t('menu.samples')" placement="bottom" :hide-after="3000">
                <img src="../../static/images/muster.png" alt="StruViMan graphic"/></el-tooltip></a>
                </div>
    
                <div>
                <h2>StruViMan</h2>
                <h3>Visualisierung mittelalterlicher Handschriften</h3>
                
                <h4 style="text-align: right; margin-right: 77px;">Für einige illustrative Beispiele klicken Sie bitte auf die nebenstehende Grafik. </h4>
                </div>
    
                <div>
                  <p>Eine wachsende Zahl von Handschriften ist digital online verfügbar. Dies bietet den Wissenschaftlern neue Möglichkeiten, sich mit Manuskripten und deren Inhalten auseinanderzusetzen. Da es sich bei alten Kodizes um komplexe Objekte handelt und ihr aktueller Zustand oft das Ergebnis mehrerer Produktionsschichten ist, ist es sinnvoll, ihre Komponente über Bild und Text hinaus zu untersuchen. Unterschiede in Produktionseinheiten, Beschreibstoffen, Lagen und Schreibern (um nur einige Elemente zu nennen) können alle einen Einblick in die Entwicklung des Kodex als ein Objekt, das sich im Laufe der Zeit verändert, geben.</p>

                  <p>Die Strukturvisualisierung von Manuskripten (StruViMan) ist ein Webservice, der als praktische Erweiterung des Projekts der Paratexte der griechischen Bibel, eines ERC-Projekts an der LMU München, entwickelt wurde. Unter Verwendung hauptsächlich digitaler Reproduktionen (wie sie z. B. über die NTVMR in Μünster erhältlich sind) überprüft das Team jedes neutestamentliche Manuskript sorgfältig und das Vorhandensein von biblischen Texten und Paratexten wird in der Pinakes-Datenbank dokumentiert.</p>

                  <p>StruViMan transformiert diese Manuskriptdaten in eine visuelle Darstellung, die die Struktur eines Manuskripts auf einen Blick sichtbar macht. Die Visualisierung liefert Informationen sowohl zur chronologischen Entwicklung des Kodex (hier in Form der verschiedenen Produktionseinheiten) als auch zu den strukturellen Aspekten seines Inhalts (in diesem Modell sind die Inhaltselemente nach Kategorien geordnet). Weitere Informationen sind durch Anklicken der entsprechenden Teile der Visualisierung leicht zugänglich.</p>
    
                <p><b>Nun, was müssen Sie tun, um es zu benutzen?</b><br>
                Bitte klicken Sie hier auf den Hilfe-Button  
                  <el-tooltip class="item" effect="dark" :content="$t('menu.help')" placement="bottom" :hide-after="2000">
                      <el-button 
                        type="primary" 
                        icon="el-icon-question"
                        size="mini"
                        v-on:click="$bus.$emit('open,window', 'help')"
                    ></el-button>
                  </el-tooltip> 
                 oder in der grauen Leiste oberhalb.<br>
                Dort finden Sie alle Erklärungen, die Sie benötigen.<br><br>
                <b>Für einige illustrative Beispiele klicken Sie bitte<a href="/sample.html"> hier</a>.</b>
                </p>
                </div>
              </span>
</template>

<script >

export default {
    name: 'VStartInfoEn',
    props: {
        backgroundStyle: {
            default: ''
        }
    }
}

</script>

