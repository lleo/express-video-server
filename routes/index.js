
/*
 * GET app page.
 */

exports.index = function(req, res){
  var cfg = { }
  cfg['title'] = req.app.get('title')
  res.render('index', cfg)
};