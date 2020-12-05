

const texts = require('./texts');

// Adds $bus to each Vue component so that events can be sent and recieved accross the DOM.
// To send an event use this.$bus.$emit( eventName: String, eventObject: Object )
// To listen for events use this.$bus.$on( eventName: String, function( eventObject:Object ){...} )

Plugin.install = function(Vue, options){
    
    let bus = new Vue();
    
    Vue.prototype.$bus = bus;
    
    Vue.prototype.$text = texts.get;

};

module.exports = Plugin;
