var nodemon = require('nodemon');

const build = require('../src/client/build/buildbase');

nodemon({
  script: 'index.js'
});

build({ watch:true }, ()=>{
});

