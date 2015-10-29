#!/usr/bin/env node

'use strict';

let http       = require('http')
  , path       = require('path')
  , util       = require('util')
  , u          = require('lodash')

let debuglog = util.debuglog
  , info  = debuglog('info')
  , warn  = debuglog('warn')
  , error = debuglog('error')
  , terminate = function terminate(xit, msgs) {
    let log = xit != 0 ? console.error : console.log

    if ( u.isArray(msgs) )
      msgs.forEach(function (e,i,a){ log(msgs[i]) })
    if ( u.isString(msgs) )
      log(msgs)
    if ( !msgs ) {
      log("WTF is msgs supposed to be? xit =", xit)
      exit(1)
    }

    exit(xit)
  }
  , log   = console.log
  , loge  = console.error

let express = require('express') // v4
  , routes = require('./routes')
  , stream = require('./routes/stream')

let favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , multer = require('multer')
  , errorHandler = require('errorhandler')

let app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'jade')
let cfgfn = './config.json'
  , cfg = fs.readFileSync(cfgfn)
app.set('config', cfg)

app.use(favicon(__dirname+'/img/favicon.ico'))
app.use(logger('dev'))
app.use(methodOverride())
app.use(session({ resave: true
                , saveUninitialized: true
                , secret:"foobar"
                }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('multer')
app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'static')))

app.get('/', routes.index)
app.get('/stream/:video', stream)


let svr = http.createServer(app)

svr.listen(app.get('port'), function on_bind() {
  info("server listenting on port = %d", app.port)
})