'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

let cfg =  require('../../server/config');

const path = require('path')
console.log('***** loading index', __dirname );

console.log('==> Rerouting to ', 'http://localhost:'+cfg.port+'/' )

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    assetsRoot: path.resolve(__dirname, '../../../public'),
    proxyTable: {
        '/testfiles': {
            target: 'http://localhost:'+cfg.port+'/'
        },    
        '/samplefiles': {
            target: 'http://localhost:'+cfg.port+'/'
        },
    
        '/viewmanuscript': {
          target: 'http://localhost:'+cfg.port+'/'
      },
      '/admin/*': {
          target: 'http://localhost:'+cfg.port+'/'
      },
      '/api/*': {
          target: 'http://localhost:'+cfg.port+'/'
      },
      '/static/*': {
          target: 'http://localhost:'+cfg.port+'/'
      },
    '/startjs': {
        target: 'http://localhost:'+cfg.port+'/',
        filter: function (pathname, req) {
          console.log('getting', pathname);
          return true;
        }
      }
/*

*/
    },

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 8088, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    
    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for struviman.html
    struviman: path.resolve(__dirname, '../../../public/struviman.html'),
    // Template for test.html
    testPage: path.resolve(__dirname, '../../../public/test.html'),
    // Template for admin.html
    adminPage: path.resolve(__dirname, '../../../public/admin.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../../../public'),
//    assetsRoot: '/',
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
