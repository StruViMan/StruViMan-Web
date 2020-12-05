<!--
    VLangSwitcher

    Simple component to enable the user to change the language.

-->

<template>
    <span class="vlangswitch" >
        <span >
        </span>
        <el-select 
            size="mini"
            v-model="lang"
            v-on:change="changeLang"
        >
            <el-option 
                v-for="l in langs"
                :key="l"
                :value="l"
                :label="$t('lang.'+l, l)"
            ></el-option>
        </el-select>
    </span>
</template>

<script >
export default {
    name: 'VLangSwitcher',
    methods: {
        changeLang: function(){
            this.$bus.$emit('langchange', this.lang );

            this.$i18n.locale = this.lang;
            this.$store.commit('setLanguage', this.lang );
        }
    },
    data: function(){
        return {
            langs: ['en', 'de', 'fr'],
            lang: this.$i18n.locale
        };
    }
}
</script>

<style >

    .el-select--mini {
        width: 120px;
    }

    .vlangswitch {
        margin-right: 20px;
    }
</style>
