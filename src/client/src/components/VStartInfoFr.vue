<template >
        <span class="bgrndinfo" :style="backgroundStyle">
                <div style="float: right; margin-top:23px;">
                <a href="/sample.html">
                <el-tooltip class="item" effect="dark" :content="$t('menu.samples')" placement="bottom" :hide-after="3000">
                <img src="../../static/images/muster.png" alt="StruViMan graphic"/></el-tooltip></a>
                </div>
    
                <div>
                <h2>StruViMan</h2>
                <h3>Visualisation de manuscrits médiévaux</h3>
                
                <h4 style="text-align: right; margin-right: 77px;">Pour des exemples illustratifs, veuillez cliquer sur la vignette ci-contre. </h4>
                </div>
    
                <div>
                <p>Un nombre croissant de manuscrits est disponible en ligne sous la forme de documents numérisés, ce qui offre aux chercheurs de nouvelles possibilités pour étudier les manuscrits et leur contenu. Puisque les anciens manuscrits sont des objets complexes et que leur état actuel est souvent le résultat de plusieurs étapes de production, il est logique d’étudier leurs composantes au-delà de l’image et du texte. Les différences d’unités de production, de support matériel, de cahiers et de copistes (pour ne nommer que quelques éléments) permettent de donner un aperçu de l’évolution du codex comme objet qui se modifie avec le temps.</p>
    
                <p>La visualisation structurelle des manuscrits (StruViMan) est un service en ligne conçu comme une extension pratique du projet des Paratextes de la Bible grecque, un projet ERC à la LMU de Munich. En utilisant surtout des reproductions numériques (par exemple celles qui sont disponibles sur le site du NTVMR à Μünster), l’équipe révise chaque manuscrit du Nouveau Testament avec soin et la présence de textes bibliques et de paratextes est documentée dans la base de données Pinakes.</p>
    
                <p>StruViMan transforme ces données sur les manuscrits en une représentation visuelle qui révèle immédiatement la structure d’un manuscrit. La visualisation fournit des informations à la fois sur l’évolution chronologique du codex (ici sous la forme des différentes unités de production) et sur les aspects structurels de son contenu (dans ce modèle, ceux-ci sont organisés par catégories). Il suffit de cliquer sur les différentes parties de la visualisation pour accéder à de plus amples informations.</p>
    
                <p><b>Que faut-il faire pour l’utiliser?</b><br>
                Veuillez cliquer sur le bouton d’aide ici 
                  <el-tooltip class="item" effect="dark" :content="$t('menu.help')" placement="bottom" :hide-after="2000">
                      <el-button 
                        type="primary" 
                        icon="el-icon-question"
                        size="mini"
                        v-on:click="$bus.$emit('open,window', 'help')"
                    ></el-button>
                  </el-tooltip> 
                 ou dans la barre grise ci-dessus.<br>
                Vous y trouverez toutes les explications dont vous avez besoin.<br><br>
                <b>Pour des exemples illustratifs, veuillez cliquer <a href="/sample.html"> ici</a>.</b>
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

