
module.exports = function(session){
    
    const Store = session.Store;
    
    function WaterlineExpressSessionStoreStore( dbSessionCollection, options) {
    
        Store.call(this, options || {});
        const dbstore = dbSessionCollection;
    
        this.all = (cb) => {
            dbstore.find().then(
                res =>{ cb(null, res) },
                err => { cb(err) }
            );
        }
    
        this.destroy = (sid, cb) => {
            dbstore.destroy({sid: sid}).then(
                res =>{ cb(null) },
                err => { cb(err) }
            );
        }
    
        this.clear = (cb) => {
            dbstore.destroy().then(
                res =>{ cb(null) },
                err => { cb(err) }
            );
        }
    
        this.length = (cb) => {
            dbstore.find().then(
                res =>{ cb(null, res.length ) },
                err => { cb(err) }
            );
        }
    
        this.get = (sid, cb) => {
            dbstore.find({sid: sid}).then(
                res =>{ 
                    if(res && res[0]) {
                        cb(null, res[0].data );
                    } else {
                        cb(null, null);
                    }
                },
                err => { cb(err) }
            );
        }
    
        this.set = (sid, session, cb) => {
            dbstore.find({sid: sid} ).then(
                res =>{
                    if(!res || res.length==0) {
                        dbstore.create( {sid: sid, data: session} ).then(
                            ok=>{},
                            e=>{
                                cb(e);
                            }
                        );
                    } else {
                        dbstore.update( {sid: sid} , {data: session} ).then(
                            ok=>{},
                            e=>{
                                cb(e);
                            }
                        );
                    }
                    cb(null) ;
                },
                err => { cb(err) }
            );
        }
    
        this.touch = (sid, session, cb) => {
            dbstore.find({sid: sid}).then(
                res =>{ cb(null) },
                err => { cb(err) }
            );
        }

    }
    const util = require('util');
    util.inherits(WaterlineExpressSessionStoreStore, Store);
    
    return WaterlineExpressSessionStoreStore;
}
