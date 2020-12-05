
let texts = {
    "coled.cu": 'Production Units',
    "coled.segment": 'Pieces of Content'
};


module.exports = {
    get: function(key){
        let r = texts[key] || 'unknown??';
        return r;
    }
};
