# StruViMan

> LMU StruViMan Manuscript HTML viewer

## Dependencies
Programmed, using these frameworks.
- [Vue.js](https://vuejs.org/) (For HTML pages)
- [VueX.js](https://vuex.vuejs.org/en/) (State storage engine)
- [Express.js](http://expressjs.com/) (For the webserver)
- [Element UI](http://element.eleme.io/#/en-US/component/installation) (as component framework)
- [vue-i18n](https://www.npmjs.com/package/vue-i18n) (for multilaguage support)
- [axios](https://github.com/axios/axios) (for ajax/http requests)
- [waterline](http://waterlinejs.org/) (for db persistance)
- [node-svg2img](https://github.com/fuzhenn/node-svg2img#readme) (To convert svg to image)


## Prerequisites

- [Node js](https://nodejs.org/en/) Version >= 6.9


## Build Setup

``` bash
# install dependencies. Run once only after git clone
npm install

# After making chanes to the client source, the application needs to be recompiled.
# This is achieved with:-
npm run build

# Run Web server. After start open browser page at http://localhost:8080/test.html Where 8080 is the port number displayed.
npm run start

# For develepment use :-
npm run dev:server 
# Then 
npm run dev

```

---

## Installation

This assumes that the system has access to a MongDB instance.

### Get the source
Retrieve the source code from the LMU git repository
``` bash
git clone git@git.gwi.uni-muenchen.de:CStrolz/struviman-web.git
```

### Install dependencies (Node JS >= 6.9 required)
Next the required libraries need to be installed with.
``` bash
cd struviman-web
npm install
```

### Build the client
Now the files that will be loaded by the browser need to be compiled.
This is done by running
``` bash
npm run build
```

### Create config file
Create a file called config.json similar to the file below. This file is used to config the server component.

``` js
{
    "port": 9009,  // Port where the server listens for connections.
    "adminPass": "pass", // Password for the admin page
    "providers": {
        "pinakes": {
            // Server connection that the Struviman server will use
            // to retrieve the XML files from Pinakes
            // "{id}" will be replaced by the Pinakes document ID.
            "url": "http://localhost:81/notices/cote/getXML/{id}/"
        }
    },
    
    "waterline_mongo": {
        "adapter": "sails-mongo",
        "config": {
            // URL connection to the MongDB instance.
            // Replace "usrname", "passwd", "mongohost" and "27017"
            // with the required values for the MongoDB server.
            "url": "mongodb://usrname:passwd@mongohost:27017/struviman"
        }
    }
}

```

### Starting
The server can now be started with
``` bash
node index
```
or
``` bash
npm run start
```




