
var util = require('util')
  , path = require('path')

module.exports = playVideoHandler

var ext2mimeType = {
  "webm": "video/webm"
, "mp4" : "video/mp4"
, "ogg" : "video/ogg"
, "ogv" : "video/ogg"
}

function filename2mimetype(fn) {
  var ext = path.extname(fn).toLowerCase().replace(/\./, '')
  return ext2mimeType[ext]
}
var streamuri = "/stream"

function playVideoHandler(req, res, next) {
  var vidfn, time
    , ext, mimetype, stream, title

  console.log("req.query = %j", req.query)

  vidfn = req.query.video
  time = parseInt(req.query.t) || 0
  // if req.query.t is not set parseInt returns NaN which is falsey

  stream = path.join(streamuri, vidfn)

  title = path.basename(vidfn, path.extname(vidfn))

  mimetype = filename2mimetype(vidfn)

  console.log("!!!mimetype=%s", mimetype)

  res.render("play", { filename : vidfn
                     , initTime : time
                     , title    : title
                     , mimetype : mimetype
                     , stream   : stream
                     , skipSec  : 30
                     , backSec  : 5 })

}