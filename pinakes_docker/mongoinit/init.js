db.createUser( { user: "root", pwd: "struviroot", customData: { employeeId: 12345 }, roles: [ "dbAdmin", "dbOwner"] }, { w: "majority" , wtimeout: 5000 } );


        
