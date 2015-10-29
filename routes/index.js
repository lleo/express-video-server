
/*
 * GET app page.
 */

exports.index = function(req, res){
  var cfg = req.app.get('config')
  cfg['title'] = req.app.get('title')
  res.render('index', cfg)
};