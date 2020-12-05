const path = require('path');
const fs = require('fs');

const app = require('./src/server/server');

let cfg =  require('./src/server/config');

if( cfg.logfile ) {
    var logfile = cfg.logfile;
    var logStream = fs.createWriteStream(logfile, { flags: 'w' });
    console.log('### writing logs to ', cfg.logfile );
    process.stdout.write = process.stderr.write = logStream.write.bind(logStream);
}

app.listen(cfg.port, () => {
    console.log('StruViMan running on port '+ cfg.port);
});

