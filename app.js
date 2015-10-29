#!/usr/bin/env node

'use strict';

/**
 * Module dependencies.
 */

var express    = require('express')
  , routes     = require('./routes')
  , play       = require('./routes/play')
  , stream     = require('./routes/stream')
  , http       = require('http')
  , path       = require('path')
  , util       = require('util')

var stylus = require('stylus')

var app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.set('title', "LLeo's Video Server")
console.log("Title:", app.get('title'))

app.set('video directory', path.resolve(process.cwd(), 'videos'))
console.log("Using 'video directory' = %s", app.get('video directory'))

app.use(express.logger('dev'))
app.use(express.favicon()) //currently switched places with express.logger()

//app.use(function(req, res, next){
//  console.log(JSON.stringify(req.headers, " "))
//  next()
//})

app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(app.router)
app.use(stylus.middleware(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'static')))

// development only
if ('development' == app.get('env')) {
  app.locals.pretty = true
  app.use(express.errorHandler())
}

app.get('/', routes.index)
app.get('/play', play)
app.get('/stream/:video', stream)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'))
})
