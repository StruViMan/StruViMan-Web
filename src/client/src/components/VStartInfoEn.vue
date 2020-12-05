<template >
        <span class="bgrndinfo" :style="backgroundStyle">
                <div style="float: right; margin-top:23px;">
                <a href="/sample.html">
                <el-tooltip class="item" effect="dark" :content="$t('menu.samples')" placement="bottom" :hide-after="3000">
                <img src="../../static/images/muster.png" alt="StruViMan graphic"/></el-tooltip></a>
                </div>
    
                <div>
                <h2>StruViMan</h2>
                <h3>Visualization of medieval Manuscripts</h3>
                
                <h4 style="text-align: right; margin-right: 77px;">For some illustrative examples please click on the adjacent graphic </h4>
                </div>
    
                <div>
                <p>A growing number of manuscripts are available digitally online. This offers new opportunities for scholars to engage with manuscripts and their contents. Since ancient codices are complex objects and their current state is often the result of several layers of production, it is useful to explore their dimensions in a way that goes beyond image and text. Differences in production units, material support, quires and scribes (to name but a few) can all provide insight into the development of the codex as an evolving object over time.</p>
    
                <p>The Structural Visualization of Manuscripts (StruViMan) is a web service that was created as a practical extension of the Paratexts of the Greek Bible Project, an ERC project based at the LMU in Munich. Using mainly digital reproductions (such as those available through the NTVMR in Μünster), the team carefully reviews each New Testament manuscript and the presence of biblical texts and paratexts is documented in the Pinakes database.</p>
    
                <p>StruViMan takes these manuscript data and transforms them into a visual representation that reveals a manuscript’s structure at a glance. The visualization provides information related both to the codex’s chronological development (here in the form of the different production units) and to the structural aspects of its contents (in this model, these are arranged by category). Further information is accessed easily by clicking on the relevant parts of the visualization.</p>
    
                <p><b>Well, what do you have to do to use it?</b><br>
                Please click on the help button here 
                  <el-tooltip class="item" effect="dark" :content="$t('menu.help')" placement="bottom" :hide-after="2000">
                      <el-button 
                        type="primary" 
                        icon="el-icon-question"
                        size="mini"
                        v-on:click="$bus.$emit('open,window', 'help')"
                    ></el-button>
                  </el-tooltip> 
                 or in the gray bar above.<br>
                There you will find all the explanations you need.<br><br>
                <b>For some illustrative examples please click<a href="/sample.html"> here</a>.</b>
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

