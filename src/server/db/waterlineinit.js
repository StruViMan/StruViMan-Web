var Waterline = require('waterline');

const collections=[];

let def = {
    identity: 'session',
    datastore: 'default',
    primaryKey: 'sid',
    dontUseObjectIds: true,
    attributes: {
        sid: {type: 'string', required: true },
        data: {type: 'json'}
    }
};
let c = Waterline.Collection.extend(def);
c._def = def;
collections.push( c );

// Store for translations.
def = {
    identity: 'i18n',
    datastore: 'default',
    primaryKey: 'key',
    dontUseObjectIds: true,
    attributes: {
        key: {type: 'string', required: true },
        langs: {type: 'json'},
        meta: {type: 'json'},
    }
};
c = Waterline.Collection.extend(def);
c._def = def;
collections.push( c );

// Store for logging.
def = {
    identity: 'logs',
    datastore: 'default',
    primaryKey: 'time',
    dontUseObjectIds: true,
    attributes: {
        time: {type: 'number', required: true },
        level: {type: 'string', required: true },
        path: {type: 'string' },
        msg: {type: 'json'},
        args: {type: 'json'},
    }
};
c = Waterline.Collection.extend(def);
c._def = def;
collections.push( c );

function WaterlineHandler(cfg, suppliedCollections){
    const waterline = new Waterline();
    const cols = collections || [];
    let self = this;
    self.store={};
    (suppliedCollections || []).forEach(c=>{
        cols.push(c);
    });
    cols.forEach( c=>{
        waterline.registerModel(c);
    });
    const adapter = cfg.waterline.adapter || 'sails-disk';
    const config = {
        adapters: {
          'struviman': require(adapter)
        },
      
        datastores: {
          default: {
            adapter: 'struviman'
          }
        }
    };
    cfg.waterline.config = cfg.waterline.config || {
        filePath: '.struvimandb/'
    };
    Object.keys(cfg.waterline.config).forEach(k=>{
        config.datastores.default[k] = cfg.waterline.config[k];
    });

    this.init = function(){
        return new Promise((resolve, reject)=>{
            waterline.initialize(config, (err, ontology)=>{
                if(err) {
                    console.error( err );
                    return;
                }
                cols.forEach( c=>{
                    let cn = c._def.identity.substr(0,1).toUpperCase() + c._def.identity.substr(1);
                    self[cn] = ontology.collections[c._def.identity];
                });
                resolve( self );
            });
        });
    }

}

module.exports = WaterlineHandler;
