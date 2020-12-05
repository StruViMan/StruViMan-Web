
let settid=1;

export default {
    computed: {
        getsettings: function(){
            let s;
            if(this.manuscript){
                s = this.manuscript._window.settings;
            } else {
                s = this.$store.getters.settings;
            }
            s = this.$store.getters.settingsCopy(s);
            delete s.mode;
            return s;
        },
        canEditSettings: function(){
            if(this.setting('mode')!='easy'){
              return true;
            }
            return false;
        }
    },
    methods: {
        onSettingChanged: function(key, val){},
        setting: function(key, val){
          if(val!=undefined){
            this.onSettingChanged(key, val);
            this.$store.commit('setSetting', [key, val] );
          } else {
            return this.$store.getters.setting(key);
          }
        },
        setSettings: function(newSetts){
            if(this.manuscript){
              Object.keys(newSetts).forEach(k=>{
                this.setting(k, newSetts[k]);
              });
              this.$store.commit('updateManuscript', this.manuscript );
            } else {
                Object.keys(newSetts).forEach(k=>{
                  this.onSettingChanged(k, newSetts[k]);
                });
                this.$store.commit('updateSettings', newSetts );
            }
        },
        applySetting: function(set){
          this.setting( set.name, set.val );
          if(this.editSettingsGlobal){
            this.$bus.$emit('globalSettingsSet', set);
          }
        },
        saveSettings: function(saved){
          this.showsettings=false;
          if(!saved){
            if(this.editSettingsGlobal){
              this.$bus.$emit('globalSettingsCancel', true );
            }
            this.cancelSettings();
          } else {
            
          }
          this.$bus.$emit('editSettingsEnd');
          this.endEditingSettings();
        },
        cancelSettings: function(){
          if(this._tsetts){
              this.setSettings( this._tsetts );
          }
          this.endEditingSettings();
        },
        resetSettings: function(){
          let defaults = this.$store.getters.originalSettings;
          delete defaults.mode;
          this.setSettings( defaults );
          if(this.editSettingsGlobal){
            this.$bus.$emit('resetSettings', defaults );
          }
        },
        toggleSettings: function(){
          if(this.showsettings){
            if(this.editSettingsGlobal){
              this.$bus.$emit('globalSettingsCancel', true );
            } else {
              this.$bus.$emit('editSettingsEnd', this.sid);
              this.cancelSettings();
            }
            this.showSettingsButton = true;
          } else {
            this._tsetts = this.$store.getters.settingsCopy( this.getsettings );
            this.$bus.$emit('editSettingsStart', this.sid);
            this.showSettingsButton = false;
          }
          this.showsettings = !this.showsettings;
        },
        startEditingSettings: function(){
          this.showSettingsButton = false;
        },
        endEditingSettings: function(){
          this._tsetts = null;
          this.showSettingsButton = true;
          this.editSettingsGlobal = false;
        },
        allsettingsToggle: function(newval){
            if(newval){
                this.editSettingsGlobal = true;
                this.$bus.$emit('globalSettingsStart', {sid: this.sid, settings:this.getsettings } );
            } else {
                this.$bus.$emit('globalSettingsCancel', false );
                this.editSettingsGlobal = false;
                this.showSettingsButton = true;
            }
        }
    },
    data: function(){
        this.$bus.$on('editSettingsStart', (sid)=>{
          if(this.sid != sid){
            this.showSettingsButton = false;
          }
        });
        this.$bus.$on('editSettingsEnd', ()=>{
          this.showSettingsButton = true;
        });
        this.$bus.$on('globalSettingsStart', (info)=>{
          if(this.canEditSettings){
            this.$store.commit('setGlobalEditing', true );
            if(this.sid != info.sid){
              this._tsetts = this.$store.getters.settingsCopy( this.getsettings );
              this.setSettings( info.settings );
            }
          }
        });
        this.$bus.$on('globalSettingsSet', (sett)=>{
          if(this.canEditSettings && !this.editSettingsGlobal){
            this.applySetting(sett);
          }
        });
        this.$bus.$on('globalSettingsSave', ()=>{
          this.endEditingSettings();
          this.$store.commit('setGlobalEditing', false );
        });
        this.$bus.$on('globalSettingsCancel', (closeWin)=>{
          if(this.canEditSettings && !this.editSettingsGlobal){
            this.cancelSettings();
            if(!closeWin){
              this.showSettingsButton = false;
            } else {
              this.endEditingSettings();
            }
          } else {
            this.$store.commit('setGlobalEditing', false );
          }
        });
        this.$bus.$on('resetSettings', (setts)=>{
          if(this.canEditSettings && !this.editSettingsGlobal){
            this.setSettings( setts );
          }
        });
        return {
            showsettings: false,
            showSettingsButton: true,
            editSettingsGlobal: false,
            sid: settid++
        };
    }
};